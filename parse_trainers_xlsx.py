import anydoc
import sys

doc_path = r"c:\Users\Julian\Documents\AI-workspace\nuzlocke-companion\docs\Pokemon Gen 3 Trainers DataSheet.xlsx"
output_path = r"c:\Users\Julian\Documents\AI-workspace\nuzlocke-companion\docs\trainers_data.md"

try:
    print(f"Parsing {doc_path}...")
    markdown_output = anydoc.to_markdown(doc_path)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(markdown_output)
    
    print(f"Successfully wrote parsed markdown to {output_path}")
    print("Preview of the first 500 characters:")
    print(markdown_output[:500])
except Exception as e:
    print(f"Error parsing document: {e}")
    sys.exit(1)
