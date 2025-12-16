#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import os
import sys

def main():
    os.chdir(r"c:\Users\miche\OneDrive\Documentos\roundKids\RoundKids")
    
    print("🔄 Adicionando arquivos...")
    subprocess.run(["git", "add", "."], check=True)
    print("✓ Arquivos adicionados\n")
    
    print("💾 Fazendo commit...")
    subprocess.run([
        "git", "commit", "-m", 
        "fix: Exibição correta de hora de criação e nome do criador em alertas"
    ], check=True)
    print("✓ Commit realizado\n")
    
    print("🚀 Enviando para GitHub...")
    subprocess.run(["git", "push", "origin", "main"], check=True)
    print("✓ Push concluído!\n")
    
    print("✅ Todas as mudanças foram enviadas para GitHub com sucesso!")

if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar comando git: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro: {e}")
        sys.exit(1)
