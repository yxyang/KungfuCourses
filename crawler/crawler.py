import sys
import urllib
import urllib2
import re
import json
import os
import sys
import getopt

from bs4 import BeautifulSoup

root_urls = {"schedulebuilder":"https://schedulebuilder.berkeley.edu/explore/courses/SP/2016/"}

##############################################################################
# THIS PARSER IS NOT PERFECT; FRONT END MIGHT NEED TO PERFORM ERROR CHECKING #
##############################################################################
def parse_prereq(department, number, string):
	# Deal with or and and 
	string = re.sub(r" and ", "&", string)
	string = re.sub(r"[,.]* or [a-zA-Z0-9\s]+[;.]+", "", string)
	result = []
	for course in re.findall(r"[A-Za-z\s]*[0-9A-Z&]+", string):
		course = course.strip()
		if number == course:
			continue
		# print(course)
		if re.match(r"[A-Z]{1}[a-zA-Z\s]+[0-9A-Z\&]+", course):
			try:
				depart = re.match(r"(?P<depart>[a-zA-Z\s]+)[0-9]", course).group("depart")
			except:
				continue
			numbers = re.findall(r"[0-9]+[A-Z]*", course)
			result += [depart + " " + number for number in numbers]
		elif re.match(r"[0-9]+[A-Z]*", course):
			numbers = re.findall(r"[0-9]+[A-Z]*", course)
			result += [department + " " + number for number in numbers]

	return result

class Spider:

	user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36'  
	headers = {'User-Agent': user_agent}


class CourseSpider(Spider):

# >>> m = re.match(r"(?P<first_name>\w+) (?P<last_name>\w+)", "Malcolm Reynolds")
# >>> m.group('first_name')
# 'Malcolm'
# >>> m.group('last_name')
# 'Reynolds'

	def __init__(self, number_limit):
		self.number_limit = number_limit
		self.url = root_urls['schedulebuilder']
		self.start = 3372
		self.depart_map = {}

	def pre_crawl(self):
		url = "https://schedulebuilder.berkeley.edu/explore/"
		request = urllib2.Request(url, headers = self.headers)
		html = urllib2.urlopen(request).read()
		soup = BeautifulSoup(html)
		for li in soup.find_all("li"): 
			m = re.match(r"(?P<depart>[a-zA-Z\s]+)\s\((?P<DEPART>[A-Z\s\,]+)\)", li.text)
			if m:
				self.depart_map[m.group("depart")] = m.group("DEPART")

		# Save All Majors
		filename = "./data/map.json"
		if not os.path.exists(os.path.dirname(filename)):
			os.makedirs(os.path.dirname(filename))
		with open(filename, "w+") as outfile:
			json.dump(self.depart_map, outfile)



	def crawl(self):
		self.pre_crawl()
		i = 0 # 61A
		try:
			while i < self.number_limit:
				result = {}
				request = urllib2.Request(self.url+str(i+self.start), headers = self.headers)
				html = urllib2.urlopen(request).read()
				soup = BeautifulSoup(html)
				# Use re to match titles
				title_raw = soup.find('h4').text
				try:
					title_m = re.match(r"(?P<depart>[a-zA-Z\s]+)\s(?P<number>[0-9A-Z]+)\s-\s(?P<name>[a-zA-Z\s\.]+)", title_raw)
					result['depart'] = title_m.group('depart')
					result['number'] = title_m.group('number')
					result['name'] = title_m.group('name')
					other_data = [[dt.text, dd.text] for dt, dd in zip(soup.find_all("dt"), soup.find_all("dd"))]
					# print(other_data)
					for item in other_data:
						if item[0] == "Description":
							result['descrp'] = item[1]
						elif item[0] == "Units":
							result['units'] = item[1]
						elif item[0] == "Prerequisites":
							result['prereq'] = parse_prereq(result['depart'], result['number'], item[1])
							print(result['prereq'])
					i += 1
				except:
					i += 1
					continue
					# print(result)
				yield result

		except urllib2.URLError, e:
			print(e.code)
			print(e.reason)
			return

	def save(self):
		# 	def archive_page(self, ownerid, html, date):
		# with open('G:/academics/spyder/'+ownerid+'/'+date+'.html', 'wb') as file_:
		# 	print('Archiving '+ ownerid +', as of ' + date + '  ...')
		# 	file_.write(html)
		for course in self.crawl():
			try:
				depart_trim = self.depart_map[course['depart']]
				filename = "./data/"+depart_trim+"/"+course['number']+".json"
				if not os.path.exists(os.path.dirname(filename)):
					os.makedirs(os.path.dirname(filename))
				with open(filename, "w+") as outfile:
					print("Writing: "+filename)
					json.dump(course, outfile)
			except:
				print("Error writing: "+str(course))
				continue

def main():
    # parse command line options
    args = sys.argv[1:]
    if (len(args) != 1):
    	print("Error: incorrect argument number")
    	sys.exit(1)
    try:
    	num = int(args[0])
    except:
    	print("Error: argument must be a number")
    	sys.exit(1)
    spider = CourseSpider(int(args[0]))
    spider.save()



if __name__ == "__main__":
    main()

# print(parse_prereq("Computer Science", "186", "61B and 61C."))
				




		
	

