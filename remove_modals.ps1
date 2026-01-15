# Script PowerShell para remover modais inline do App.tsx
# Este script remove os modais restantes que foram movidos para arquivos separados

$file = "App.tsx"
$content = Get-Content $file -Raw

Write-Host "Removendo modais inline do arquivo App.tsx..."

# Lista de modais para remover
$modals = @(
    "AddDeviceModal",
    "EditDeviceModal",
    "AddExamModal",
    "EditExamModal",
    "AddMedicationModal",
    "EditMedicationModal",
    "AddSurgicalProcedureModal",
    "EditSurgicalProcedureModal",
    "AddRemovalDateModal",
    "AddEndDateModal",
    "AddDietRemovalDateModal",
    "EditDietRemovalDateModal",
    "EditDeviceRemovalDateModal",
    "EditMedicationEndDateModal",
    "AlertModal",
    "JustificationModal"
)

$removedCount = 0

foreach ($modalName in $modals) {
    # Padrão regex para encontrar o modal completo (desde const até };)
    $pattern = "const ${modalName}:[^;]*?\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\};?\s*"
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, ""
        $removedCount++
        Write-Host "✓ Removido: $modalName"
    } else {
        Write-Host "✗ Não encontrado: $modalName"
    }
}

# Salvar o arquivo
$content | Set-Content $file -NoNewline

Write-Host "`n======================================"
Write-Host "Total de modais removidos: $removedCount de $($modals.Count)"
Write-Host "======================================"
