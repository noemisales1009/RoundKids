import { supabase } from '../../supabaseClient'
import type { Database } from '../types/database.types'

type Patient = Database['public']['Tables']['patients']['Row']
type NPTCalculation = Database['public']['Tables']['npt_calculations']['Insert']

// ==================== PACIENTES ====================

/**
 * Busca todos os pacientes
 */
export const getAllPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .is('archived_at', null)
    .order('bed_number', { ascending: true })

  if (error) throw error
  return data as Patient[]
}

/**
 * Busca pacientes por status
 */
export const getPatientsByStatus = async (status: string = 'estavel') => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('status', status)
    .order('bed_number', { ascending: true })
  
  if (error) throw error
  return data as Patient[]
}

/**
 * Busca um paciente por ID
 */
export const getPatientById = async (id: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Patient
}

/**
 * Busca pacientes por nome (busca parcial)
 */
export const searchPatientsByName = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name')
  
  if (error) throw error
  return data as Patient[]
}

/**
 * Cria um novo paciente
 */
export const createPatient = async (patientData: Database['public']['Tables']['patients']['Insert']) => {
  const { data, error } = await supabase
    .from('patients')
    .insert(patientData as any)
    .select()
    .single()
  
  if (error) throw error
  return data as Patient
}

/**
 * Atualiza um paciente
 */
export const updatePatient = async (id: string, updates: Database['public']['Tables']['patients']['Update']) => {
  const { data, error } = await supabase
    .from('patients')
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Patient
}

// ==================== CÁLCULOS NPT ====================

/**
 * Salva um novo cálculo de NPT
 */
export const saveNPTCalculation = async (calculation: NPTCalculation) => {
  // Busca o usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('npt_calculations')
    .insert({
      ...calculation,
      user_id: user.id
    } as any)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Busca todos os cálculos de um paciente
 */
export const getPatientCalculations = async (patientId: string) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    .select(`
      *,
      patients (
        name,
        bed_number,
        dob
      ),
      users (
        name,
        email
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Busca um cálculo específico por ID
 */
export const getCalculationById = async (id: string) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    .select(`
      *,
      patients (
        name,
        bed_number,
        dob,
        peso
      ),
      users (
        name
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Atualiza um cálculo existente
 */
export const updateCalculation = async (
  id: string, 
  updates: Database['public']['Tables']['npt_calculations']['Update']
) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Altera o status de um cálculo
 */
export const updateCalculationStatus = async (
  id: string, 
  status: 'ativo' | 'revisado' | 'cancelado',
  notes?: string
) => {
  const updates: any = { status }
  if (notes) updates.notes = notes
  
  return updateCalculation(id, updates)
}

/**
 * Busca os últimos cálculos (todos os pacientes)
 */
export const getRecentCalculations = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('npt_calculations_with_patient')
    .select('*')
    .limit(limit)
  
  if (error) throw error
  return data
}

/**
 * Busca cálculos por status
 */
export const getCalculationsByStatus = async (status: string) => {
  const { data, error } = await supabase
    .from('npt_calculations')
    .select(`
      *,
      patients (name, bed_number),
      users (name)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ==================== UTILITÁRIOS ====================

/**
 * Converte dados da calculadora para o formato do banco
 */
export const convertCalculationDataForDB = (
  patientId: string,
  calculatorState: {
    weight: number
    dateOfBirth: string
    aminoAcidDose: number
    lipidDose: number
    calorieNitrogenRatio: number
    hydrationTarget: number
    proteinConcentration: number
    lipidConcentration: number
    glucoseSources: [number, number]
    sodiumDose: number
    potassiumDose: number
    calciumDose: number
    magnesiumDose: number
    phosphorusDose: number
    phosphorusSource: 'sodium' | 'potassium'
    nptStages: 1 | 2 | 4
  },
  calculatedResults: {
    totalVolume: number
    totalCalories: number
    finalGlucoseConcentration: number
    osmolarity: number
    isPeripheralRouteWarning: boolean
    calciumConcentrationMeqPerLiter?: number
    magnesiumConcentrationMeqPerLiter?: number
    divalentTrivalentCationsConcentration?: number
  },
  notes?: string
): NPTCalculation => {
  return {
    patient_id: patientId,
    user_id: '', // Será preenchido pela função saveNPTCalculation
    weight: calculatorState.weight,
    date_of_birth: calculatorState.dateOfBirth,
    amino_acid_dose: calculatorState.aminoAcidDose,
    lipid_dose: calculatorState.lipidDose,
    calorie_nitrogen_ratio: calculatorState.calorieNitrogenRatio,
    hydration_target: calculatorState.hydrationTarget,
    protein_concentration: calculatorState.proteinConcentration,
    lipid_concentration: calculatorState.lipidConcentration,
    glucose_source_1: calculatorState.glucoseSources[0],
    glucose_source_2: calculatorState.glucoseSources[1],
    sodium_dose: calculatorState.sodiumDose,
    potassium_dose: calculatorState.potassiumDose,
    calcium_dose: calculatorState.calciumDose,
    magnesium_dose: calculatorState.magnesiumDose,
    phosphorus_dose: calculatorState.phosphorusDose,
    phosphorus_source: calculatorState.phosphorusSource,
    npt_stages: calculatorState.nptStages,
    total_volume: calculatedResults.totalVolume,
    total_calories: calculatedResults.totalCalories,
    glucose_concentration_final: calculatedResults.finalGlucoseConcentration,
    osmolarity: calculatedResults.osmolarity,
    calcium_concentration_meq_per_liter: calculatedResults.calciumConcentrationMeqPerLiter,
    magnesium_concentration_meq_per_liter: calculatedResults.magnesiumConcentrationMeqPerLiter,
    divalent_trivalent_cations_concentration: calculatedResults.divalentTrivalentCationsConcentration,
    peripheral_route_warning: calculatedResults.isPeripheralRouteWarning,
    notes: notes || null,
    status: 'ativo'
  }
}

/**
 * Exporta as estatísticas gerais
 */
export const getDashboardStats = async () => {
  // Total de pacientes ativos
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'estavel')

  // Total de cálculos hoje
  const today = new Date().toISOString().split('T')[0]
  const { count: calculationsToday } = await supabase
    .from('npt_calculations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today)

  // Cálculos ativos
  const { count: activeCalculations } = await supabase
    .from('npt_calculations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ativo')

  return {
    totalPatients: totalPatients || 0,
    calculationsToday: calculationsToday || 0,
    activeCalculations: activeCalculations || 0
  }
}
