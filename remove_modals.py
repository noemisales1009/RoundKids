import re

# Read the file
with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Modal definitions to remove (from line numbers identified)
modals_to_remove = [
    'AddDeviceModal',
    'EditDeviceModal',
    'AddExamModal',
    'EditExamModal',
    'AddMedicationModal',
    'EditMedicationModal',
    'AddSurgicalProcedureModal',
    'EditSurgicalProcedureModal',
    'AddRemovalDateModal',
    'AddEndDateModal',
    'AddDietRemovalDateModal',
    'EditDietRemovalDateModal',
    'EditDeviceRemovalDateModal',
    'EditMedicationEndDateModal',
    'AlertModal',
    'JustificationModal'
]

# Remove each modal definition
for modal_name in modals_to_remove:
    # Pattern to match the modal definition
    # Matches: const ModalName: React.FC<...> = ... }; (including multiline)
    pattern = rf'const {modal_name}: React\.FC<[^>]+>\s*=\s*\([^)]+\)\s*=>\s*\{{(?:[^{{}}]+|\{{(?:[^{{}}]+|\{{[^{{}}]*\}})*\}})*\}};'
    
    # Try to find and remove
    matches = list(re.finditer(pattern, content, re.DOTALL))
    if matches:
        # Remove from end to beginning to preserve positions
        for match in reversed(matches):
            content = content[:match.start()] + '\n' + content[match.end():]
            print(f"Removed {modal_name}")
    else:
        print(f"Could not find pattern for {modal_name}")

# Write back
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! File updated.")
