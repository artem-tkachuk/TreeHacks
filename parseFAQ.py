from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import csv

opts = Options()
opts.set_headless()

assert opts.headless  # Operating in headless mode
browser = Chrome(options=opts)


urls = [
    'https://www.ca.gov/agency/?item=department-of-motor-vehicles',
    'https://www.ca.gov/agency/?item=department-of-food-and-agriculture',
    'https://www.ca.gov/agency/?item=california-department-of-education',
    'https://www.ca.gov/agency/?item=california-earthquake-authority',
    'https://www.ca.gov/agency/?item=office-of-environmental-health-hazard-assessment'
    ] #add as many urls as needed here

for url in urls:
    print(url)
    browser.get(url)
    print(browser.find_element_by_id('service_faq'))

    faqHTML = browser.find_element_by_id('service_faq').get_attribute('innerHTML')
    soup = BeautifulSoup(faqHTML, 'lxml')

    questions = soup.find_all('h4', class_='panel-title')
    answers = soup.find_all('div', class_='panel-body') #todo links

    for question, answer in zip(questions, answers): 
        with open("caDotGovKB.tsv", "a+") as tsvfile:
            writer = csv.writer(tsvfile, delimiter='\t')
            writer.writerow([question.text, answer.text])

browser.quit()

        
