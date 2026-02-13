import sys
import json
import wikipediaapi

def search_wikipedia(query, lang='en'):
    wiki = wikipediaapi.Wikipedia(
        user_agent='GanapathiMentorAI/1.0 (contact@ganapathimentor.ai)',
        language=lang
    )
    
    try:
        page = wiki.page(query)
        
        if page.exists():
            return {
                "title": page.title,
                "summary": page.summary[0:1500] if page.summary else "",
                "url": page.fullurl,
                "exists": True
            }
        else:
            return {
                "title": query,
                "summary": "No direct Wikipedia page found for this query.",
                "url": "",
                "exists": False
            }
    except Exception as e:
        return {
            "title": query,
            "summary": f"Error interacting with Wikipedia API: {str(e)}",
            "url": "",
            "exists": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
    
    query = sys.argv[1]
    result = search_wikipedia(query)
    print(json.dumps(result))
