from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

# Create embeddings model (local Ollama)
embeddings = OllamaEmbeddings(
    model="llama3"  # or use a dedicated embedding model like "nomic-embed-text"
)

# Text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

# Global vector store
vector_store = None


def store_recipe_document(text: str):
    global vector_store

    chunks = text_splitter.split_text(text)

    if vector_store is None:
        vector_store = FAISS.from_texts(chunks, embeddings)
    else:
        vector_store.add_texts(chunks)


def retrieve_recipe_chunks(query: str) -> str:
    global vector_store

    if vector_store is None:
        return "No recipes stored yet."

    docs = vector_store.similarity_search(query, k=5)
    return "\n\n".join([doc.page_content for doc in docs])
