from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_recipe_pdf(recipe: dict) -> str:
    file_path = "final_recipe.pdf"
    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(recipe["title"], styles["Heading1"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("Ingredients:", styles["Heading2"]))
    for ingredient in recipe["ingredients"]:
        elements.append(Paragraph(f"- {ingredient}", styles["Normal"]))

    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Steps:", styles["Heading2"]))

    for step in recipe["steps"]:
        elements.append(Paragraph(step, styles["Normal"]))

    doc.build(elements)
    return file_path
