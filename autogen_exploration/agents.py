from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_ext.models.ollama import OllamaChatCompletionClient


from tools import fetch_recipe_url, retrieve_recipe, generate_recipe_pdf

model_client = OllamaChatCompletionClient(
    model="llama3",
    base_url="http://localhost:11434",
)

intake_agent = UserProxyAgent(
    name="user_intake"
)

intent_agent = AssistantAgent(
    name="intent_structurer",
    model_client=model_client,
    system_message="""
Convert food descriptions into structured JSON.
Return ONLY valid JSON with:
- cuisine
- diet
- flavor_profile
- difficulty
- cooking_time
"""
)

research_agent = AssistantAgent(
    name="recipe_researcher",
    model_client=model_client,
    tools=[fetch_recipe_url, retrieve_recipe],
    system_message="""
Use retrieved documents to synthesize a new recipe.
Return JSON:
{
  "title": "",
  "ingredients": [],
  "steps": []
}
"""
)

approval_agent = UserProxyAgent(
    name="approval_agent"
)

output_agent = AssistantAgent(
    name="pdf_output_agent",
    model_client=model_client,
    tools=[generate_recipe_pdf],
    system_message="""
Call the generate_recipe_pdf tool with the approved recipe JSON.
"""
)
