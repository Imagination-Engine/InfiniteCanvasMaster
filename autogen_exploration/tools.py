import requests
from bs4 import BeautifulSoup

def fetch_recipe_url(url: str) -> str:
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    return soup.get_text()

from rag import retrieve_recipe_chunks

def retrieve_recipe(query: str) -> str:
    return retrieve_recipe_chunks(query)

from pdf_generator import generate_recipe_pdf
