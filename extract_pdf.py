import PyPDF2
import json

def extract():
    reader = PyPDF2.PdfReader('c:\\Users\\darul\\OneDrive\\Desktop\\compport\\mohnaseeb\\assets\\Mohammed_Naseeb.pdf')
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open('c:\\Users\\darul\\OneDrive\\Desktop\\compport\\mohnaseeb\\resume_extracted.txt', 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == '__main__':
    extract()
