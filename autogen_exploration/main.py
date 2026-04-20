import asyncio

from agents import (
    intent_agent,
    research_agent,
    output_agent
)

from rag import store_recipe_document
from tools import fetch_recipe_url


async def main():

    # 1️⃣ Get user goal
    user_input = input("What would you like to cook?\n")

    intent_result = await intent_agent.run(task=user_input)
    intent = intent_result.messages[-1].content
    print("\nStructured Intent:\n", intent)


    # 2️⃣ Collect URLs
    raw_urls = input("\nPaste recipe URLs (comma separated, or press enter to skip):\n")

    if raw_urls.strip():
        urls = [u.strip() for u in raw_urls.split(",")]

        for url in urls:
            print(f"\nFetching: {url}")
            text = fetch_recipe_url(url)
            store_recipe_document(text)

        print("Recipes stored in vector memory.")


    # 3️⃣ Generate recipe using RAG
    recipe_result = await research_agent.run(task=intent)
    recipe = recipe_result.messages[-1].content
    print("\nGenerated Recipe:\n", recipe)


    # 4️⃣ Human approval loop
    while True:
        feedback = input("\nType 'approve' or give feedback:\n")

        if feedback.lower() == "approve":
            break

        recipe_result = await research_agent.run(
            task=f"{intent}\nCurrent Draft:\n{recipe}\nFeedback:\n{feedback}"
        )
        recipe = recipe_result.messages[-1].content
        print("\nUpdated Recipe:\n", recipe)


    # 5️⃣ Generate PDF
    await output_agent.run(task=recipe)
    print("\nPDF generated!")


if __name__ == "__main__":
    asyncio.run(main())
