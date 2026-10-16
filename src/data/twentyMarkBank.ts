import type { IGCSETask, IGCSEUnit } from "../types";

// 50 Paper 2 Question 6 style 20-mark programming questions, imported from the
// "Twenty Mark Question Bank" artifact. Each has the code file the student opens
// (starter), a model answer, the itemised + levels-based mark scheme, and any data
// files the program reads (e.g. members.txt). Marked by AI against the mark scheme.
// Generated file - edit the source bank and regenerate rather than editing by hand.

export const TWENTY_MARK_BANK_TASKS: IGCSETask[] = [
 {
  "id": "tmb_q01",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q01 Sports day points",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A school records the results of its sports day.\nEach house earns points for the events it enters.\nHouse names, points and the number of entries are stored in three arrays.\n\nThe code file contains these data structures:\n• tbl_house stores the house names.\n• tbl_points stores the total points earned by each house.\n• tbl_entries stores the number of events each house entered.\n\nThe program must:\n• allow a teacher to input a house name and the points for a late result\n    – if the house is in the array, the points are added to its total\n    – if the house is not in the array, an appropriate error message is given\n• display a table with:\n    – a header row and a dividing line\n    – each house, its points, its entries and its points per entry to 1 decimal place\n    – a final line showing the totals for all houses\n• display the name of the winning house, which is the house with the most points per entry\nPoints per entry is calculated as points / entries.\n\nFigure 1 shows the output from a working program.\n```\nHouse name: Heron\nPoints to add: 12\nHouse       Points  Entries   Per entry\n---------------------------------------\nFalcon         128       32         4.0\nHeron          155       35         4.4\nKestrel        119       28         4.2\nMerlin         137       34         4.0\n---------------------------------------\nTotals         539      129         4.2\n\nWinning house: Heron\n```\n(Figure 1)\n\nOpen Q01 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q01FINISHED with the correct file extension for the programming language.",
  "starter": "# Q01\n\ntbl_house = [\"Falcon\", \"Heron\", \"Kestrel\", \"Merlin\"]\ntbl_points = [128, 143, 119, 137]\ntbl_entries = [32, 35, 28, 34]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q01.py",
  "solution": "# Q01\n\ntbl_house = [\"Falcon\", \"Heron\", \"Kestrel\", \"Merlin\"]\ntbl_points = [128, 143, 119, 137]\ntbl_entries = [32, 35, 28, 34]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<10}{:>8}{:>9}{:>12}\"\n\n\n# Returns the points earned for each event entered\ndef per_entry(points, entries):\n    if entries == 0:\n        return 0.0\n    return points / entries\n\n\n# Add a late result to the house that earned it\nhouse = input(\"House name: \")\npoints = int(input(\"Points to add: \"))\n\nfound = -1\nfor index in range(len(tbl_house)):\n    if tbl_house[index] == house:\n        found = index\n\nif found == -1:\n    print(\"House not found\")\nelse:\n    tbl_points[found] = tbl_points[found] + points\n\n# Display the table of results\nprint(LAYOUT.format(\"House\", \"Points\", \"Entries\", \"Per entry\"))\nprint(\"-\" * 39)\n\ntotal_points = 0\ntotal_entries = 0\nbest = 0\n\nfor index in range(len(tbl_house)):\n    rate = per_entry(tbl_points[index], tbl_entries[index])\n    print(LAYOUT.format(tbl_house[index], tbl_points[index],\n                        tbl_entries[index], round(rate, 1)))\n\n    total_points = total_points + tbl_points[index]\n    total_entries = total_entries + tbl_entries[index]\n\n    # Keep the index of the best house so far\n    if rate > per_entry(tbl_points[best], tbl_entries[best]):\n        best = index\n\nprint(\"-\" * 39)\nprint(LAYOUT.format(\"Totals\", total_points, total_entries,\n                    round(per_entry(total_points, total_entries), 1)))\nprint()\nprint(\"Winning house:\", tbl_house[best])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable for tracking the totals or the best house (guidance: Initial values could be zero or the first house in the array)",
    "description": "Any variable for tracking the totals or the best house"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: The same index can be used across all three arrays, regardless of loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Points per entry calculated as points / entries (guidance: Disregard accuracy of indexing)",
    "description": "Points per entry calculated as points / entries"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of points per entry)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input name with the array (guidance: == or any valid equality test)",
    "description": "Relational operator used to compare the input name with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Any subprogram that performs part of the task)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the house is not found (guidance: Any suitable message)",
    "description": "Error message displayed when the house is not found"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The points array is updated for the house that was found",
    "description": "The points array is updated for the house that was found"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Totals for all houses calculated correctly by any method",
    "description": "Totals for all houses calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Winning house identified correctly (guidance: By any method except hard-coded)",
    "description": "Winning house identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable for tracking the totals or the best house (guidance: Initial values could be zero or the first house in the array)\nA2: A loop to all items in an array (guidance: The same index can be used across all three arrays, regardless of loop type)\nA3: Points per entry calculated as points / entries (guidance: Disregard accuracy of indexing)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of points per entry)\nA6: Relational operator used to compare the input name with the array (guidance: == or any valid equality test)\nA7: A subprogram is defined and called (guidance: Any subprogram that performs part of the task)\nA8: Error message displayed when the house is not found (guidance: Any suitable message)\nA9: The points array is updated for the house that was found\nA10: Totals for all houses calculated correctly by any method\nA11: Winning house identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q02",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q02 Phone shop stock",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A phone shop keeps a record of the handsets it has in stock.\nModel names, prices and the number in stock are stored in three arrays.\nStaff need a program to record a sale and to review the stock.\n\nThe code file contains these data structures:\n• tbl_model stores the model names.\n• tbl_price stores the price of one handset in pounds.\n• tbl_stock stores the number of handsets in stock.\n\nThe program must:\n• allow a member of staff to input a model name and the number sold\n    – if the model is not in the array, an appropriate error message is given\n    – if there are not enough handsets in stock, an appropriate error message is given and the stock is not changed\n    – otherwise the stock is reduced and the value of the sale is displayed\n• display a table with:\n    – a header row and a dividing line\n    – each model, its price, its stock and the value of that stock\n    – LOW beside any model with fewer than 5 handsets in stock\n• display the total value of all the stock\n\nFigure 1 shows the output from a working program.\n```\nModel sold: Orbit 7\nNumber sold: 2\nSale value: £699.00\n\nModel          Price  Stock      Value  \n------------------------------------------\nOrbit 5      £199.99     12   £2399.88  \nOrbit 7      £349.50      1    £349.50  LOW\nNova Mini    £149.00      8   £1192.00  \nNova Max     £629.00      2   £1258.00  LOW\nZen Lite      £89.95     25   £2248.75  \n------------------------------------------\nTotal stock value: £7448.13\n```\n(Figure 1)\n\nOpen Q02 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q02FINISHED with the correct file extension for the programming language.",
  "starter": "# Q02\n\ntbl_model = [\"Orbit 5\", \"Orbit 7\", \"Nova Mini\", \"Nova Max\", \"Zen Lite\"]\ntbl_price = [199.99, 349.50, 149.00, 629.00, 89.95]\ntbl_stock = [12, 3, 8, 2, 25]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q02.py",
  "solution": "# Q02\n\ntbl_model = [\"Orbit 5\", \"Orbit 7\", \"Nova Mini\", \"Nova Max\", \"Zen Lite\"]\ntbl_price = [199.99, 349.50, 149.00, 629.00, 89.95]\ntbl_stock = [12, 3, 8, 2, 25]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLOW_LEVEL = 5\nLAYOUT = \"{:<11}{:>9}{:>7}{:>11}  {}\"\n\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the position of a model, or -1 when it is not stocked\ndef find_model(name):\n    for index in range(len(tbl_model)):\n        if tbl_model[index] == name:\n            return index\n    return -1\n\n\n# Record the sale\nmodel = input(\"Model sold: \")\nsold = int(input(\"Number sold: \"))\n\nposition = find_model(model)\n\nif position == -1:\n    print(\"Model not stocked\")\nelif sold > tbl_stock[position]:\n    print(\"Not enough stock. Only\", tbl_stock[position], \"left\")\nelse:\n    tbl_stock[position] = tbl_stock[position] - sold\n    print(\"Sale value:\", money(tbl_price[position] * sold))\n\n# Display the stock table\nprint()\nprint(LAYOUT.format(\"Model\", \"Price\", \"Stock\", \"Value\", \"\"))\nprint(\"-\" * 42)\n\ntotal_value = 0.0\n\nfor index in range(len(tbl_model)):\n    value = tbl_price[index] * tbl_stock[index]\n    total_value = total_value + value\n\n    warning = \"\"\n    if tbl_stock[index] < LOW_LEVEL:\n        warning = \"LOW\"\n\n    print(LAYOUT.format(tbl_model[index], money(tbl_price[index]),\n                        tbl_stock[index], money(value), warning))\n\nprint(\"-\" * 42)\nprint(\"Total stock value:\", money(total_value))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable used to hold the number in stock or the number sold (guidance: Accept use of the array element directly)",
    "description": "Any variable used to hold the number in stock or the number sold"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Value of the sale calculated as price * number sold",
    "description": "Value of the sale calculated as price * number sold"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the value column)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input model with the array",
    "description": "Relational operator used to compare the input model with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the model is not stocked (guidance: Any suitable message)",
    "description": "Error message displayed when the model is not stocked"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Stock array updated only when there is enough stock (guidance: No mark if the stock is reduced below zero)",
    "description": "Stock array updated only when there is enough stock"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total value of all stock calculated correctly by any method",
    "description": "Total value of all stock calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "LOW displayed for every model below the low level, and no others (guidance: Accept any equivalent warning text)",
    "description": "LOW displayed for every model below the low level, and no others"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable used to hold the number in stock or the number sold (guidance: Accept use of the array element directly)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Value of the sale calculated as price * number sold\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the value column)\nA6: Relational operator used to compare the input model with the array\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed when the model is not stocked (guidance: Any suitable message)\nA9: Stock array updated only when there is enough stock (guidance: No mark if the stock is reduced below zero)\nA10: Total value of all stock calculated correctly by any method\nA11: LOW displayed for every model below the low level, and no others (guidance: Accept any equivalent warning text)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q03",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q03 Library fines",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A library charges a fine when a book is returned late.\nMember names and the number of days each book is late are stored in two arrays.\nThe fine depends on how late the book is.\n\nThe code file contains these data structures:\n• tbl_member stores the member names.\n• tbl_days stores the number of days each member's book is late.\n\nThe program must:\n• calculate the fine for each member using a subprogram:\n    – 1 to 7 days late: 20p per day\n    – 8 to 28 days late: £1.40 plus 50p for each day over 7\n    – more than 28 days late: a fixed charge of £15.00\n• display a table with:\n    – a header row and a dividing line\n    – each member, the days late and the fine\n• display the total of all the fines\n• display the name of the member with the largest fine\n\nFigure 1 shows the output from a working program.\n```\nMember      Days late     Fine\n------------------------------\nAfzal               3    £0.60\nBronte              0    £0.00\nChiara             12    £3.90\nDmitri             35   £15.00\nEsme                7    £1.40\nFemi               29   £15.00\n------------------------------\nTotal fines: £35.90\nLargest fine: Dmitri\n```\n(Figure 1)\n\nOpen Q03 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q03FINISHED with the correct file extension for the programming language.",
  "starter": "# Q03\n\ntbl_member = [\"Afzal\", \"Bronte\", \"Chiara\", \"Dmitri\", \"Esme\", \"Femi\"]\ntbl_days = [3, 0, 12, 35, 7, 29]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q03.py",
  "solution": "# Q03\n\ntbl_member = [\"Afzal\", \"Bronte\", \"Chiara\", \"Dmitri\", \"Esme\", \"Femi\"]\ntbl_days = [3, 0, 12, 35, 7, 29]\n\n# --------------------------------------------------\n# Write your code below this line\n\nDAILY_RATE = 0.20\nEXTRA_RATE = 0.50\nMAX_FINE = 15.00\nLAYOUT = \"{:<10}{:>11}{:>9}\"\n\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the fine owed for a book returned this many days late\ndef fine_for(days):\n    if days <= 0:\n        return 0.0\n    elif days <= 7:\n        return days * DAILY_RATE\n    elif days <= 28:\n        return 7 * DAILY_RATE + (days - 7) * EXTRA_RATE\n    else:\n        return MAX_FINE\n\n\n# Display the table of fines\nprint(LAYOUT.format(\"Member\", \"Days late\", \"Fine\"))\nprint(\"-\" * 30)\n\ntotal = 0.0\nworst = 0\n\nfor index in range(len(tbl_member)):\n    fine = fine_for(tbl_days[index])\n    total = total + fine\n\n    print(LAYOUT.format(tbl_member[index], tbl_days[index],\n                        money(fine)))\n\n    if fine > fine_for(tbl_days[worst]):\n        worst = index\n\nprint(\"-\" * 30)\nprint(\"Total fines:\", money(total))\nprint(\"Largest fine:\", tbl_member[worst])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable for tracking the total or the largest fine (guidance: Initial values could be zero or the first member in the array)",
    "description": "Any variable for tracking the total or the largest fine"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: The same index can be used across both arrays, regardless of loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Fine for 1 to 7 days calculated as days * 0.20 (guidance: Accept 20 and pence throughout)",
    "description": "Fine for 1 to 7 days calculated as days * 0.20"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the fine)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to select the correct band (guidance: <= or < with adjusted values)",
    "description": "Relational operators used to select the correct band"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to calculate the fine (guidance: Must return a value or set a variable the main program uses)",
    "description": "A subprogram is defined and called to calculate the fine"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Fine for 8 to 28 days uses the 50p rate for days over 7",
    "description": "Fine for 8 to 28 days uses the 50p rate for days over 7"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Fixed charge applied for more than 28 days (guidance: Accept 15 or 15.00)",
    "description": "Fixed charge applied for more than 28 days"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total of all fines calculated correctly by any method",
    "description": "Total of all fines calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Member with the largest fine identified correctly (guidance: By any method except hard-coded)",
    "description": "Member with the largest fine identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable for tracking the total or the largest fine (guidance: Initial values could be zero or the first member in the array)\nA2: A loop to all items in an array (guidance: The same index can be used across both arrays, regardless of loop type)\nA3: Fine for 1 to 7 days calculated as days * 0.20 (guidance: Accept 20 and pence throughout)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the fine)\nA6: Relational operators used to select the correct band (guidance: <= or < with adjusted values)\nA7: A subprogram is defined and called to calculate the fine (guidance: Must return a value or set a variable the main program uses)\nA8: Fine for 8 to 28 days uses the 50p rate for days over 7\nA9: Fixed charge applied for more than 28 days (guidance: Accept 15 or 15.00)\nA10: Total of all fines calculated correctly by any method\nA11: Member with the largest fine identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q04",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q04 Recycling collections",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A council weighs the recycling collected from each street.\nStreet names, the weight of paper and the weight of glass are stored in three arrays.\nAll weights are in kilograms.\n\nThe code file contains these data structures:\n• tbl_street stores the street names.\n• tbl_paper stores the kilograms of paper collected.\n• tbl_glass stores the kilograms of glass collected.\n\nThe program must:\n• allow a collection crew to input a street name and the kilograms of paper to add\n    – if the street is in the array, the weight is added to its paper total\n    – if the street is not in the array, an appropriate error message is given\n• display a table with:\n    – a header row and a dividing line\n    – each street, its paper, its glass, its total and the percentage of that total which is paper\n    – percentages shown as whole numbers\n• display the total weight collected from all streets\n• display the name of the street that collected the most\n\nFigure 1 shows the output from a working program.\n```\nStreet: Birch Way\nKilograms of paper: 25.5\n\nStreet         Paper   Glass   Total  Paper %\n---------------------------------------------\nAsh Lane       142.5    97.5   240.0       59\nBirch Way      113.5   112.0   225.5       50\nCedar Rise     203.5    46.5   250.0       81\nDale Road       96.0    54.0   150.0       64\n---------------------------------------------\nTotal collected: 865.5 kg\nMost collected: Cedar Rise\n```\n(Figure 1)\n\nOpen Q04 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q04FINISHED with the correct file extension for the programming language.",
  "starter": "# Q04\n\ntbl_street = [\"Ash Lane\", \"Birch Way\", \"Cedar Rise\", \"Dale Road\"]\ntbl_paper = [142.5, 88.0, 203.5, 96.0]\ntbl_glass = [97.5, 112.0, 46.5, 54.0]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q04.py",
  "solution": "# Q04\n\ntbl_street = [\"Ash Lane\", \"Birch Way\", \"Cedar Rise\", \"Dale Road\"]\ntbl_paper = [142.5, 88.0, 203.5, 96.0]\ntbl_glass = [97.5, 112.0, 46.5, 54.0]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<12}{:>8}{:>8}{:>8}{:>9}\"\n\n\n# Returns what percentage of a total is made up by part\ndef percentage(part, total):\n    if total == 0:\n        return 0\n    return round(part / total * 100)\n\n\n# Add a new collection to a street\nstreet = input(\"Street: \")\nweight = float(input(\"Kilograms of paper: \"))\n\nfound = -1\nfor index in range(len(tbl_street)):\n    if tbl_street[index] == street:\n        found = index\n\nif found == -1:\n    print(\"Street not found\")\nelse:\n    tbl_paper[found] = tbl_paper[found] + weight\n\n# Display the table of collections\nprint()\nprint(LAYOUT.format(\"Street\", \"Paper\", \"Glass\", \"Total\", \"Paper %\"))\nprint(\"-\" * 45)\n\ngrand_total = 0.0\nbest = 0\n\nfor index in range(len(tbl_street)):\n    street_total = tbl_paper[index] + tbl_glass[index]\n    grand_total = grand_total + street_total\n\n    print(LAYOUT.format(tbl_street[index], tbl_paper[index],\n                        tbl_glass[index], street_total,\n                        percentage(tbl_paper[index], street_total)))\n\n    # Keep the street with the heaviest collection so far\n    if street_total > tbl_paper[best] + tbl_glass[best]:\n        best = index\n\nprint(\"-\" * 45)\nprint(\"Total collected:\", round(grand_total, 1), \"kg\")\nprint(\"Most collected:\", tbl_street[best])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable for tracking the grand total or the best street (guidance: Initial values could be zero or the first street in the array)",
    "description": "Any variable for tracking the grand total or the best street"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Percentage calculated as paper / total * 100 (guidance: Disregard rounding method)",
    "description": "Percentage calculated as paper / total * 100"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the percentage)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input street with the array",
    "description": "Relational operator used to compare the input street with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the street is not found (guidance: Any suitable message)",
    "description": "Error message displayed when the street is not found"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Paper array updated for the street that was found",
    "description": "Paper array updated for the street that was found"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total weight for all streets calculated correctly by any method",
    "description": "Total weight for all streets calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Street collecting the most identified correctly (guidance: By any method except hard-coded)",
    "description": "Street collecting the most identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable for tracking the grand total or the best street (guidance: Initial values could be zero or the first street in the array)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Percentage calculated as paper / total * 100 (guidance: Disregard rounding method)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the percentage)\nA6: Relational operator used to compare the input street with the array\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed when the street is not found (guidance: Any suitable message)\nA9: Paper array updated for the street that was found\nA10: Total weight for all streets calculated correctly by any method\nA11: Street collecting the most identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q05",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q05 Swimming club times",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A swimming club records the time each swimmer takes to swim 100 metres.\nSwimmer names and times are stored in two arrays.\nTimes are stored as a whole number of seconds.\nA swimmer qualifies for the gala if they swim 100 metres in 75 seconds or less.\n\nThe code file contains these data structures:\n• tbl_swimmer stores the swimmer names.\n• tbl_seconds stores each swimmer's time in seconds.\n\nThe program must:\n• display a table with:\n    – a header row and a dividing line\n    – each swimmer, their time in seconds and their time as minutes and seconds\n    – the word QUALIFIED beside each swimmer who has met the qualifying time\n• times as minutes and seconds must be produced by a subprogram and shown in the form 1:14\n• display the average time for the club as a whole number of seconds\n• display the name and time of the fastest swimmer\n• display how many swimmers have qualified\nA time of 74 seconds is displayed as 1:14\n\nFigure 1 shows the output from a working program.\n```\nSwimmer     Seconds      Time  \n----------------------------------------\nAyla             74      1:14  QUALIFIED\nBeau             81      1:21  \nCleo             69      1:09  QUALIFIED\nDara             95      1:35  \nEli              75      1:15  QUALIFIED\nFaye             88      1:28  \nGus              71      1:11  QUALIFIED\n----------------------------------------\nAverage time: 79 seconds\nFastest: Cleo 1:09\nQualified: 4\n```\n(Figure 1)\n\nOpen Q05 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q05FINISHED with the correct file extension for the programming language.",
  "starter": "# Q05\n\ntbl_swimmer = [\"Ayla\", \"Beau\", \"Cleo\", \"Dara\", \"Eli\", \"Faye\", \"Gus\"]\ntbl_seconds = [74, 81, 69, 95, 75, 88, 71]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q05.py",
  "solution": "# Q05\n\ntbl_swimmer = [\"Ayla\", \"Beau\", \"Cleo\", \"Dara\", \"Eli\", \"Faye\", \"Gus\"]\ntbl_seconds = [74, 81, 69, 95, 75, 88, 71]\n\n# --------------------------------------------------\n# Write your code below this line\n\nQUALIFY = 75\nLAYOUT = \"{:<10}{:>9}{:>10}  {}\"\n\n\n# Returns a number of seconds in the form minutes:seconds\ndef as_time(seconds):\n    minutes = seconds // 60\n    rest = seconds % 60\n    return str(minutes) + \":\" + str(rest).zfill(2)\n\n\n# Display the table of times\nprint(LAYOUT.format(\"Swimmer\", \"Seconds\", \"Time\", \"\"))\nprint(\"-\" * 40)\n\ntotal = 0\nfastest = 0\nqualified = 0\n\nfor index in range(len(tbl_swimmer)):\n    status = \"\"\n    if tbl_seconds[index] <= QUALIFY:\n        status = \"QUALIFIED\"\n        qualified = qualified + 1\n\n    print(LAYOUT.format(tbl_swimmer[index], tbl_seconds[index],\n                        as_time(tbl_seconds[index]), status))\n\n    total = total + tbl_seconds[index]\n\n    # Keep the fastest swimmer so far\n    if tbl_seconds[index] < tbl_seconds[fastest]:\n        fastest = index\n\nprint(\"-\" * 40)\nprint(\"Average time:\", round(total / len(tbl_seconds)), \"seconds\")\nprint(\"Fastest:\", tbl_swimmer[fastest], as_time(tbl_seconds[fastest]))\nprint(\"Qualified:\", qualified)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable for tracking the total, the count or the fastest swimmer (guidance: Initial values could be zero or the first swimmer in the array)",
    "description": "Any variable for tracking the total, the count or the fastest swimmer"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: The same index can be used across both arrays, regardless of loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Minutes calculated using integer division or equivalent (guidance: DIV, // or int())",
    "description": "Minutes calculated using integer division or equivalent"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the formatted time)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare a time with the qualifying time (guidance: <= 75 or < 76)",
    "description": "Relational operator used to compare a time with the qualifying time"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to format the time (guidance: Must return the formatted value)",
    "description": "A subprogram is defined and called to format the time"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Seconds in the formatted time are correct (guidance: Use of MOD or % or equivalent)",
    "description": "Seconds in the formatted time are correct"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Count of qualifying swimmers maintained",
    "description": "Count of qualifying swimmers maintained"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Average time calculated correctly by any method (guidance: Disregard rounding method)",
    "description": "Average time calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Fastest swimmer identified correctly (guidance: By any method except hard-coded)",
    "description": "Fastest swimmer identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable for tracking the total, the count or the fastest swimmer (guidance: Initial values could be zero or the first swimmer in the array)\nA2: A loop to all items in an array (guidance: The same index can be used across both arrays, regardless of loop type)\nA3: Minutes calculated using integer division or equivalent (guidance: DIV, // or int())\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the formatted time)\nA6: Relational operator used to compare a time with the qualifying time (guidance: <= 75 or < 76)\nA7: A subprogram is defined and called to format the time (guidance: Must return the formatted value)\nA8: Seconds in the formatted time are correct (guidance: Use of MOD or % or equivalent)\nA9: Count of qualifying swimmers maintained\nA10: Average time calculated correctly by any method (guidance: Disregard rounding method)\nA11: Fastest swimmer identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q06",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q06 Cafe sales",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A school cafe records what it sells each day.\nItem names, prices and the number sold are stored in three arrays.\nThe cafe manager needs a program to record sales and review the day's takings.\n\nThe code file contains these data structures:\n• tbl_item stores the names of the items on sale.\n• tbl_price stores the price of one of each item in pounds.\n• tbl_sold stores the number of each item sold so far today.\n\nThe program must:\n• allow the manager to input an item name and the number sold\n    – if the item is in the array, the number is added to the number sold\n    – if the item is not in the array, an appropriate error message is given\n• display a table with:\n    – a header row and a dividing line\n    – each item, its price, the number sold and the income from that item\n• display the total takings for the day\n• display the name of the best selling item, which is the item that has taken the most money\n\nFigure 1 shows the output from a working program.\n```\nItem sold: Soup\nNumber sold: 7\n\nItem         Price   Sold    Income\n-----------------------------------\nPanini       £2.80     34    £95.20\nWrap         £2.40     28    £67.20\nSoup         £1.60     26    £41.60\nFlapjack     £0.95     52    £49.40\nJuice        £1.20     41    £49.20\nWater        £0.80     63    £50.40\n-----------------------------------\nTotal takings: £353.00\nBest seller: Panini\n```\n(Figure 1)\n\nOpen Q06 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q06FINISHED with the correct file extension for the programming language.",
  "starter": "# Q06\n\ntbl_item = [\"Panini\", \"Wrap\", \"Soup\", \"Flapjack\", \"Juice\", \"Water\"]\ntbl_price = [2.80, 2.40, 1.60, 0.95, 1.20, 0.80]\ntbl_sold = [34, 28, 19, 52, 41, 63]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q06.py",
  "solution": "# Q06\n\ntbl_item = [\"Panini\", \"Wrap\", \"Soup\", \"Flapjack\", \"Juice\", \"Water\"]\ntbl_price = [2.80, 2.40, 1.60, 0.95, 1.20, 0.80]\ntbl_sold = [34, 28, 19, 52, 41, 63]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<10}{:>8}{:>7}{:>10}\"\n\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the money taken for one item\ndef income(price, sold):\n    return price * sold\n\n\n# Record a sale\nitem = input(\"Item sold: \")\nnumber = int(input(\"Number sold: \"))\n\nfound = -1\nfor index in range(len(tbl_item)):\n    if tbl_item[index] == item:\n        found = index\n\nif found == -1:\n    print(\"Item not on sale\")\nelse:\n    tbl_sold[found] = tbl_sold[found] + number\n\n# Display the sales table\nprint()\nprint(LAYOUT.format(\"Item\", \"Price\", \"Sold\", \"Income\"))\nprint(\"-\" * 35)\n\ntakings = 0.0\nbest = 0\n\nfor index in range(len(tbl_item)):\n    item_income = income(tbl_price[index], tbl_sold[index])\n    takings = takings + item_income\n\n    print(LAYOUT.format(tbl_item[index], money(tbl_price[index]),\n                        tbl_sold[index], money(item_income)))\n\n    # Keep the item that has taken the most money so far\n    if item_income > income(tbl_price[best], tbl_sold[best]):\n        best = index\n\nprint(\"-\" * 35)\nprint(\"Total takings:\", money(takings))\nprint(\"Best seller:\", tbl_item[best])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable for tracking the takings or the best seller (guidance: Initial values could be zero or the first item in the array)",
    "description": "Any variable for tracking the takings or the best seller"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Income calculated as price * number sold (guidance: Disregard accuracy of indexing)",
    "description": "Income calculated as price * number sold"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the income column)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input item with the array",
    "description": "Relational operator used to compare the input item with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the item is not on sale (guidance: Any suitable message)",
    "description": "Error message displayed when the item is not on sale"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Number sold array updated for the item that was found",
    "description": "Number sold array updated for the item that was found"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total takings calculated correctly by any method",
    "description": "Total takings calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Best selling item identified correctly by income, not by number sold (guidance: By any method except hard-coded)",
    "description": "Best selling item identified correctly by income, not by number sold"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable for tracking the takings or the best seller (guidance: Initial values could be zero or the first item in the array)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Income calculated as price * number sold (guidance: Disregard accuracy of indexing)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the income column)\nA6: Relational operator used to compare the input item with the array\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed when the item is not on sale (guidance: Any suitable message)\nA9: Number sold array updated for the item that was found\nA10: Total takings calculated correctly by any method\nA11: Best selling item identified correctly by income, not by number sold (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q07",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q07 Exam results",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A teacher records the marks for a class test.\nStudent names and marks out of 80 are stored in two arrays.\nThe teacher needs a program to turn the marks into grades and summarise the results.\n\nThe code file contains these data structures:\n• tbl_student stores the student names.\n• tbl_mark stores each student's mark out of 80.\n\nThe program must:\n• calculate a grade for each student using a subprogram:\n    – 64 marks or more: grade 9\n    – 56 to 63 marks: grade 7\n    – 40 to 55 marks: grade 5\n    – 24 to 39 marks: grade 3\n    – below 24 marks: grade U\n• display a table with:\n    – a header row and a dividing line\n    – each student, their mark, their percentage as a whole number and their grade\n• display the class average as a percentage to 1 decimal place\n• display the name of the student with the highest mark\n• display how many students were awarded grade U\nThe percentage is calculated as mark / 80 * 100\n\nFigure 1 shows the output from a working program.\n```\nStudent      Mark      %   Grade\n--------------------------------\nAmara          71     89       9\nBoris          38     48       3\nCai            56     70       7\nDeniz          22     28       U\nElsie          64     80       9\nFarid          49     61       5\nGreta          80    100       9\nHugo           31     39       3\n--------------------------------\nClass average: 64.2%\nHighest mark: Greta 80\nGrade U: 1\n```\n(Figure 1)\n\nOpen Q07 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q07FINISHED with the correct file extension for the programming language.",
  "starter": "# Q07\n\ntbl_student = [\"Amara\", \"Boris\", \"Cai\", \"Deniz\", \"Elsie\", \"Farid\", \"Greta\", \"Hugo\"]\ntbl_mark = [71, 38, 56, 22, 64, 49, 80, 31]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q07.py",
  "solution": "# Q07\n\ntbl_student = [\"Amara\", \"Boris\", \"Cai\", \"Deniz\", \"Elsie\", \"Farid\", \"Greta\", \"Hugo\"]\ntbl_mark = [71, 38, 56, 22, 64, 49, 80, 31]\n\n# --------------------------------------------------\n# Write your code below this line\n\nTOTAL_MARKS = 80\nLAYOUT = \"{:<10}{:>7}{:>7}{:>8}\"\n\n\n# Returns the grade awarded for a mark out of 80\ndef grade_for(mark):\n    if mark >= 64:\n        return \"9\"\n    elif mark >= 56:\n        return \"7\"\n    elif mark >= 40:\n        return \"5\"\n    elif mark >= 24:\n        return \"3\"\n    else:\n        return \"U\"\n\n\n# Display the results table\nprint(LAYOUT.format(\"Student\", \"Mark\", \"%\", \"Grade\"))\nprint(\"-\" * 32)\n\ntotal = 0\ntop = 0\nungraded = 0\n\nfor index in range(len(tbl_student)):\n    mark = tbl_mark[index]\n    grade = grade_for(mark)\n    total = total + mark\n\n    print(LAYOUT.format(tbl_student[index], mark,\n                        round(mark / TOTAL_MARKS * 100), grade))\n\n    if grade == \"U\":\n        ungraded = ungraded + 1\n\n    # Keep the highest mark so far\n    if mark > tbl_mark[top]:\n        top = index\n\nprint(\"-\" * 32)\naverage = total / len(tbl_mark) / TOTAL_MARKS * 100\nprint(\"Class average: {:.1f}%\".format(average))\nprint(\"Highest mark:\", tbl_student[top], tbl_mark[top])\nprint(\"Grade U:\", ungraded)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable for tracking the total, the count or the highest mark (guidance: Initial values could be zero or the first student in the array)",
    "description": "Any variable for tracking the total, the count or the highest mark"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: The same index can be used across both arrays, regardless of loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Percentage calculated as mark / 80 * 100 (guidance: Disregard rounding method)",
    "description": "Percentage calculated as mark / 80 * 100"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of grade or percentage)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to place a mark in a band (guidance: >= or > with adjusted values)",
    "description": "Relational operators used to place a mark in a band"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to award the grade (guidance: Must return the grade)",
    "description": "A subprogram is defined and called to award the grade"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "All five grade bands are correct (guidance: Boundary values 64, 56, 40 and 24 all correct)",
    "description": "All five grade bands are correct"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Count of grade U students maintained",
    "description": "Count of grade U students maintained"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Class average calculated correctly by any method",
    "description": "Class average calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Student with the highest mark identified correctly (guidance: By any method except hard-coded)",
    "description": "Student with the highest mark identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable for tracking the total, the count or the highest mark (guidance: Initial values could be zero or the first student in the array)\nA2: A loop to all items in an array (guidance: The same index can be used across both arrays, regardless of loop type)\nA3: Percentage calculated as mark / 80 * 100 (guidance: Disregard rounding method)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of grade or percentage)\nA6: Relational operators used to place a mark in a band (guidance: >= or > with adjusted values)\nA7: A subprogram is defined and called to award the grade (guidance: Must return the grade)\nA8: All five grade bands are correct (guidance: Boundary values 64, 56, 40 and 24 all correct)\nA9: Count of grade U students maintained\nA10: Class average calculated correctly by any method\nA11: Student with the highest mark identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q08",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q08 Bus punctuality",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A bus company monitors how late its buses are.\nRoute numbers, the number of journeys and the total minutes late are stored in three arrays.\nA route is rated on the average number of minutes a journey runs late.\n\nThe code file contains these data structures:\n• tbl_route stores the route numbers.\n• tbl_journeys stores how many journeys each route ran.\n• tbl_late stores the total minutes late for all journeys on that route.\n\nThe program must:\n• calculate the average minutes late for each route and rate it using a subprogram:\n    – under 2 minutes: Good\n    – 2 minutes to under 6 minutes: Fair\n    – 6 minutes or more: Poor\n• display a table with:\n    – a header row and a dividing line\n    – each route, its journeys, its total minutes late, its average to 1 decimal place and its rating\n• display the average minutes late across all journeys to 1 decimal place\n• display the route number with the worst average\n• display how many routes are rated Good\n\nFigure 1 shows the output from a working program.\n```\nRoute     Journeys    Late   Average  Rating\n--------------------------------------------\n12              48      62       1.3    Good\n14A             36     198       5.5    Fair\n27              52      41       0.8    Good\n33              24     156       6.5    Poor\n58              40      88       2.2    Fair\n61              30     219       7.3    Poor\n--------------------------------------------\nOverall average: 3.3 minutes\nWorst route: 61\nRated Good: 2\n```\n(Figure 1)\n\nOpen Q08 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q08FINISHED with the correct file extension for the programming language.",
  "starter": "# Q08\n\ntbl_route = [\"12\", \"14A\", \"27\", \"33\", \"58\", \"61\"]\ntbl_journeys = [48, 36, 52, 24, 40, 30]\ntbl_late = [62, 198, 41, 156, 88, 219]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q08.py",
  "solution": "# Q08\n\ntbl_route = [\"12\", \"14A\", \"27\", \"33\", \"58\", \"61\"]\ntbl_journeys = [48, 36, 52, 24, 40, 30]\ntbl_late = [62, 198, 41, 156, 88, 219]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<8}{:>10}{:>8}{:>10}{:>8}\"\n\n\n# Returns the average minutes late for one route\ndef average_late(late, journeys):\n    if journeys == 0:\n        return 0.0\n    return late / journeys\n\n\n# Returns the rating earned by an average\ndef rating_for(average):\n    if average < 2:\n        return \"Good\"\n    elif average < 6:\n        return \"Fair\"\n    else:\n        return \"Poor\"\n\n\n# Display the punctuality table\nprint(LAYOUT.format(\"Route\", \"Journeys\", \"Late\", \"Average\", \"Rating\"))\nprint(\"-\" * 44)\n\ntotal_late = 0\ntotal_journeys = 0\nworst = 0\ngood = 0\n\nfor index in range(len(tbl_route)):\n    average = average_late(tbl_late[index], tbl_journeys[index])\n    rating = rating_for(average)\n\n    print(LAYOUT.format(tbl_route[index], tbl_journeys[index],\n                        tbl_late[index], round(average, 1), rating))\n\n    total_late = total_late + tbl_late[index]\n    total_journeys = total_journeys + tbl_journeys[index]\n\n    if rating == \"Good\":\n        good = good + 1\n\n    # Keep the route with the worst average so far\n    if average > average_late(tbl_late[worst], tbl_journeys[worst]):\n        worst = index\n\nprint(\"-\" * 44)\nprint(\"Overall average: {:.1f} minutes\".format(\n    average_late(total_late, total_journeys)))\nprint(\"Worst route:\", tbl_route[worst])\nprint(\"Rated Good:\", good)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable for tracking the totals, the count or the worst route (guidance: Initial values could be zero or the first route in the array)",
    "description": "Any variable for tracking the totals, the count or the worst route"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Average calculated as minutes late / journeys (guidance: Disregard accuracy of indexing)",
    "description": "Average calculated as minutes late / journeys"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of average or rating)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to place an average in a band (guidance: < or <= with adjusted values)",
    "description": "Relational operators used to place an average in a band"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "All three ratings are awarded at the correct boundaries (guidance: 2 is Fair, 6 is Poor)",
    "description": "All three ratings are awarded at the correct boundaries"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Count of routes rated Good maintained",
    "description": "Count of routes rated Good maintained"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Overall average calculated from the totals, not from the averages (guidance: Total late / total journeys)",
    "description": "Overall average calculated from the totals, not from the averages"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Route with the worst average identified correctly (guidance: By any method except hard-coded)",
    "description": "Route with the worst average identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable for tracking the totals, the count or the worst route (guidance: Initial values could be zero or the first route in the array)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Average calculated as minutes late / journeys (guidance: Disregard accuracy of indexing)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of average or rating)\nA6: Relational operators used to place an average in a band (guidance: < or <= with adjusted values)\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: All three ratings are awarded at the correct boundaries (guidance: 2 is Fair, 6 is Poor)\nA9: Count of routes rated Good maintained\nA10: Overall average calculated from the totals, not from the averages (guidance: Total late / total journeys)\nA11: Route with the worst average identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q09",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q09 Hotel room booking",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A small hotel keeps a record of its rooms.\nRoom numbers, room types, nightly rates and whether each room is booked are stored in four arrays.\nA room that is booked is stored as True and a room that is free is stored as False.\n\nThe code file contains these data structures:\n• tbl_room stores the room numbers.\n• tbl_type stores the type of each room.\n• tbl_rate stores the nightly rate in pounds.\n• tbl_booked stores whether each room is booked.\n\nThe program must:\n• allow a receptionist to input a room number\n    – if the room number is not in the array, an appropriate error message is given\n    – if the room is already booked, an appropriate error message is given\n    – otherwise the room is booked and a confirmation with the rate is displayed\n• display a table with:\n    – a header row and a dividing line\n    – each room, its type, its rate and either Booked or Free\n• display the income from all booked rooms for one night\n• display how many rooms are still free\n\nFigure 1 shows the output from a working program.\n```\nRoom number to book: 202\nRoom 202 booked at £115.00 per night\n\nRoom    Type           Rate   Status\n------------------------------------\n101     Single       £58.00   Booked\n102     Double       £84.00     Free\n103     Double       £84.00   Booked\n201     Single       £58.00     Free\n202     Family      £115.00   Booked\n203     Double       £89.50   Booked\n301     Suite       £160.00     Free\n------------------------------------\nIncome for one night: £346.50\nRooms still free: 3\n```\n(Figure 1)\n\nOpen Q09 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q09FINISHED with the correct file extension for the programming language.",
  "starter": "# Q09\n\ntbl_room = [101, 102, 103, 201, 202, 203, 301]\ntbl_type = [\"Single\", \"Double\", \"Double\", \"Single\", \"Family\", \"Double\", \"Suite\"]\ntbl_rate = [58.00, 84.00, 84.00, 58.00, 115.00, 89.50, 160.00]\ntbl_booked = [True, False, True, False, False, True, False]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q09.py",
  "solution": "# Q09\n\ntbl_room = [101, 102, 103, 201, 202, 203, 301]\ntbl_type = [\"Single\", \"Double\", \"Double\", \"Single\", \"Family\", \"Double\", \"Suite\"]\ntbl_rate = [58.00, 84.00, 84.00, 58.00, 115.00, 89.50, 160.00]\ntbl_booked = [True, False, True, False, False, True, False]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<8}{:<10}{:>9}{:>9}\"\n\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the position of a room number, or -1 when there is no such room\ndef find_room(number):\n    for index in range(len(tbl_room)):\n        if tbl_room[index] == number:\n            return index\n    return -1\n\n\n# Take a booking\nwanted = int(input(\"Room number to book: \"))\nposition = find_room(wanted)\n\nif position == -1:\n    print(\"No such room\")\nelif tbl_booked[position]:\n    print(\"Room\", wanted, \"is already booked\")\nelse:\n    tbl_booked[position] = True\n    print(\"Room\", wanted, \"booked at\", money(tbl_rate[position]), \"per night\")\n\n# Display the room table\nprint()\nprint(LAYOUT.format(\"Room\", \"Type\", \"Rate\", \"Status\"))\nprint(\"-\" * 36)\n\nincome = 0.0\nfree = 0\n\nfor index in range(len(tbl_room)):\n    if tbl_booked[index]:\n        status = \"Booked\"\n        income = income + tbl_rate[index]\n    else:\n        status = \"Free\"\n        free = free + 1\n\n    print(LAYOUT.format(tbl_room[index], tbl_type[index],\n                        money(tbl_rate[index]), status))\n\nprint(\"-\" * 36)\nprint(\"Income for one night:\", money(income))\nprint(\"Rooms still free:\", free)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The booked array is tested to decide whether a room is available (guidance: Accept == True or the value used directly)",
    "description": "The booked array is tested to decide whether a room is available"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Only the rates of booked rooms are added to the income",
    "description": "Only the rates of booked rooms are added to the income"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the status column)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input room number with the array (guidance: Accept comparison as a string or as an integer)",
    "description": "Relational operator used to compare the input room number with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the room number does not exist (guidance: Any suitable message)",
    "description": "Error message displayed when the room number does not exist"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Booked array updated only when the room was free (guidance: No mark if an already booked room is overwritten)",
    "description": "Booked array updated only when the room was free"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Income calculated correctly by any method",
    "description": "Income calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Number of free rooms counted correctly after the booking (guidance: Must reflect the new booking)",
    "description": "Number of free rooms counted correctly after the booking"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The booked array is tested to decide whether a room is available (guidance: Accept == True or the value used directly)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Only the rates of booked rooms are added to the income\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the status column)\nA6: Relational operator used to compare the input room number with the array (guidance: Accept comparison as a string or as an integer)\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed when the room number does not exist (guidance: Any suitable message)\nA9: Booked array updated only when the room was free (guidance: No mark if an already booked room is overwritten)\nA10: Income calculated correctly by any method\nA11: Number of free rooms counted correctly after the booking (guidance: Must reflect the new booking)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q10",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q10 Energy meter readings",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A college records the electricity used by each of its buildings.\nBuilding names and meter readings at the start and end of the month are stored in three arrays.\nThe college is charged a standing charge of £12.50 for each building plus 28p for each unit used.\n\nThe code file contains these data structures:\n• tbl_building stores the building names.\n• tbl_start stores the meter reading at the start of the month.\n• tbl_end stores the meter reading at the end of the month.\n\nThe program must:\n• allow a caretaker to input a building name and a corrected end reading\n    – if the building is in the array, its end reading is replaced\n    – if the new reading is lower than the start reading, an appropriate error message is given and the reading is not changed\n    – if the building is not in the array, an appropriate error message is given\n• display a table with:\n    – a header row and a dividing line\n    – each building, its units used and its cost\n• display the total cost for the college\n• display the name of the building that used the most units\nUnits used is the end reading minus the start reading.\nThe cost of one building is 12.50 + units * 0.28\n\nFigure 1 shows the output from a working program.\n```\nBuilding: Sports\nCorrected end reading: 24400\n\nBuilding     Units      Cost\n----------------------------\nArts          1770   £508.10\nScience       3775  £1069.50\nSports        1385   £400.30\nLibrary       1145   £333.10\nCanteen       2830   £804.90\n----------------------------\nTotal cost: £3115.90\nHighest use: Science\n```\n(Figure 1)\n\nOpen Q10 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q10FINISHED with the correct file extension for the programming language.",
  "starter": "# Q10\n\ntbl_building = [\"Arts\", \"Science\", \"Sports\", \"Library\", \"Canteen\"]\ntbl_start = [45120, 88340, 23015, 31760, 52480]\ntbl_end = [46890, 92115, 24400, 32905, 55310]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q10.py",
  "solution": "# Q10\n\ntbl_building = [\"Arts\", \"Science\", \"Sports\", \"Library\", \"Canteen\"]\ntbl_start = [45120, 88340, 23015, 31760, 52480]\ntbl_end = [46890, 92115, 24400, 32905, 55310]\n\n# --------------------------------------------------\n# Write your code below this line\n\nSTANDING = 12.50\nUNIT_COST = 0.28\nLAYOUT = \"{:<10}{:>8}{:>10}\"\n\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the cost of the electricity used by one building\ndef cost_of(units):\n    return STANDING + units * UNIT_COST\n\n\n# Correct a meter reading\nname = input(\"Building: \")\nreading = int(input(\"Corrected end reading: \"))\n\nfound = -1\nfor index in range(len(tbl_building)):\n    if tbl_building[index] == name:\n        found = index\n\nif found == -1:\n    print(\"Building not found\")\nelif reading < tbl_start[found]:\n    print(\"Reading is lower than the start reading\")\nelse:\n    tbl_end[found] = reading\n\n# Display the energy table\nprint()\nprint(LAYOUT.format(\"Building\", \"Units\", \"Cost\"))\nprint(\"-\" * 28)\n\ntotal = 0.0\nhighest = 0\n\nfor index in range(len(tbl_building)):\n    units = tbl_end[index] - tbl_start[index]\n    total = total + cost_of(units)\n\n    print(LAYOUT.format(tbl_building[index], units,\n                        money(cost_of(units))))\n\n    # Keep the building using the most units so far\n    if units > tbl_end[highest] - tbl_start[highest]:\n        highest = index\n\nprint(\"-\" * 28)\nprint(\"Total cost:\", money(total))\nprint(\"Highest use:\", tbl_building[highest])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The corrected reading is compared with the start reading (guidance: Any relational operator that rejects a lower reading)",
    "description": "The corrected reading is compared with the start reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Cost calculated as standing charge + units * unit cost (guidance: Accept pence throughout)",
    "description": "Cost calculated as standing charge + units * unit cost"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the cost column)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input building with the array",
    "description": "Relational operator used to compare the input building with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the building is not found (guidance: Any suitable message)",
    "description": "Error message displayed when the building is not found"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "End reading array updated only when the new reading is valid",
    "description": "End reading array updated only when the new reading is valid"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total cost for the college calculated correctly by any method (guidance: Must include a standing charge for every building)",
    "description": "Total cost for the college calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Building using the most units identified correctly (guidance: By any method except hard-coded)",
    "description": "Building using the most units identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The corrected reading is compared with the start reading (guidance: Any relational operator that rejects a lower reading)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Cost calculated as standing charge + units * unit cost (guidance: Accept pence throughout)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the cost column)\nA6: Relational operator used to compare the input building with the array\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed when the building is not found (guidance: Any suitable message)\nA9: End reading array updated only when the new reading is valid\nA10: Total cost for the college calculated correctly by any method (guidance: Must include a standing charge for every building)\nA11: Building using the most units identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q11",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q11 Cinema seat booking",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A cinema sells seats for one screen.\nThe seating plan is stored in a two-dimensional array.\nEach row of the array is a row of seats. A free seat is stored as 0 and a sold seat is stored as 1.\nRows and seats are numbered from 1 for the customer, but the array is indexed from 0.\n\nThe code file contains these data structures:\n• tbl_seats stores the seating plan.\n• tbl_price stores the price of a seat in each row.\n\nThe program must:\n• allow a customer to input a row number and a seat number\n    – the program must validate the row number and the seat number and keep asking until both are inside the seating plan\n    – if the seat is already sold, an appropriate message is displayed\n    – otherwise the seat is sold and the price is displayed\n• display the seating plan with:\n    – a row number at the start of each line\n    – a full stop for a free seat and an X for a sold seat\n• display how many seats are still free\n• display the money taken for the seats that have been sold\n\nFigure 1 shows the output from a working program.\n```\nRow number: 5\nSeat number: 2\nThat row does not exist\nRow number: 3\nSeat number: 9\nThat seat does not exist\nRow number: 3\nSeat number: 4\nSeat sold for £7.25\n\nRow 1  . X X . . . \nRow 2  X X . . X . \nRow 3  . . . X . . \nRow 4  X . X X . X \n\nSeats still free: 14\nMoney taken: £83.75\n```\n(Figure 1)\n\nOpen Q11 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q11FINISHED with the correct file extension for the programming language.",
  "starter": "# Q11\n\ntbl_seats = [[0, 1, 1, 0, 0, 0],\n             [1, 1, 0, 0, 1, 0],\n             [0, 0, 0, 0, 0, 0],\n             [1, 0, 1, 1, 0, 1]]\n\ntbl_price = [9.50, 9.50, 7.25, 7.25]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q11.py",
  "solution": "# Q11\n\ntbl_seats = [[0, 1, 1, 0, 0, 0],\n             [1, 1, 0, 0, 1, 0],\n             [0, 0, 0, 0, 0, 0],\n             [1, 0, 1, 1, 0, 1]]\n\ntbl_price = [9.50, 9.50, 7.25, 7.25]\n\n# --------------------------------------------------\n# Write your code below this line\n\nSOLD = 1\nFREE = 0\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Displays the seating plan, one line for each row of seats\ndef show_plan(seats):\n    for row in range(len(seats)):\n        line = \"Row \" + str(row + 1) + \"  \"\n        for seat in range(len(seats[row])):\n            if seats[row][seat] == SOLD:\n                line = line + \"X \"\n            else:\n                line = line + \". \"\n        print(line)\n\n\n# Ask for a seat, rejecting anything outside the plan\nrow = 0\nseat = 0\nvalid = False\n\nwhile not valid:\n    row = int(input(\"Row number: \"))\n    seat = int(input(\"Seat number: \"))\n\n    if row < 1 or row > len(tbl_seats):\n        print(\"That row does not exist\")\n    elif seat < 1 or seat > len(tbl_seats[row - 1]):\n        print(\"That seat does not exist\")\n    else:\n        valid = True\n\n# Sell the seat if it is free\nif tbl_seats[row - 1][seat - 1] == SOLD:\n    print(\"Sorry, that seat is already sold\")\nelse:\n    tbl_seats[row - 1][seat - 1] = SOLD\n    print(\"Seat sold for\", money(tbl_price[row - 1]))\n\n# Show the plan and the summary\nprint()\nshow_plan(tbl_seats)\n\nfree = 0\ntaken = 0.0\n\nfor row in range(len(tbl_seats)):\n    for seat in range(len(tbl_seats[row])):\n        if tbl_seats[row][seat] == FREE:\n            free = free + 1\n        else:\n            taken = taken + tbl_price[row]\n\nprint()\nprint(\"Seats still free:\", free)\nprint(\"Money taken:\", money(taken))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The array element is tested to see whether the seat is already sold",
    "description": "The array element is tested to see whether the seat is already sold"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A nested loop to all seats in a row (guidance: Accept len(seats[row]) or a fixed number of seats)",
    "description": "A nested loop to all seats in a row"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The seating plan is displayed one row per line (guidance: Any sensible symbols)",
    "description": "The seating plan is displayed one row per line"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Row numbers are displayed beside the plan (guidance: Accept numbering from 1 or from 0)",
    "description": "Row numbers are displayed beside the plan"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to test that the row and seat are inside the plan (guidance: Both ends of both ranges must be tested)",
    "description": "Relational operators used to test that the row and seat are inside the plan"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A loop repeats the input until the row and seat are valid (guidance: Any post or pre-conditioned loop)",
    "description": "A loop repeats the input until the row and seat are valid"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The array is updated to show the seat as sold",
    "description": "The array is updated to show the seat as sold"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Free seats counted correctly after the booking (guidance: Must reflect the new booking)",
    "description": "Free seats counted correctly after the booking"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Money taken calculated using the price for each seat's own row",
    "description": "Money taken calculated using the price for each seat's own row"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The array element is tested to see whether the seat is already sold\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A nested loop to all seats in a row (guidance: Accept len(seats[row]) or a fixed number of seats)\nA4: The seating plan is displayed one row per line (guidance: Any sensible symbols)\nA5: Row numbers are displayed beside the plan (guidance: Accept numbering from 1 or from 0)\nA6: Relational operators used to test that the row and seat are inside the plan (guidance: Both ends of both ranges must be tested)\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: A loop repeats the input until the row and seat are valid (guidance: Any post or pre-conditioned loop)\nA9: The array is updated to show the seat as sold\nA10: Free seats counted correctly after the booking (guidance: Must reflect the new booking)\nA11: Money taken calculated using the price for each seat's own row\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q12",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q12 Class test scores",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A teacher records the marks for three tests taken by each student.\nThe marks are stored in a two-dimensional array.\nEach row holds the student's name followed by their three test marks.\nEach test is marked out of 20.\n\nThe code file contains these data structures:\n• tbl_results stores one row for each student: name, test 1, test 2, test 3.\n\nThe program must:\n• display a table with:\n    – a header row and a dividing line\n    – each student, their three marks, their total and their average to 1 decimal place\n    – the word RETAKE beside any student whose average is below 10\n• display the average mark for each of the three tests to 1 decimal place\n• display the name of the student with the highest total\n• display which test number was the hardest, which is the test with the lowest average\n\nFigure 1 shows the output from a working program.\n```\nStudent   T1  T2  T3   Total   Average  \n----------------------------------------------\nPriya     17  15  19      51      17.0  \nJonah      8  11   6      25       8.3  RETAKE\nMei       14  18  16      48      16.0  \nTomas     12   9  13      34      11.3  \nAisha     20  17  18      55      18.3  \nLuca       7   5   9      21       7.0  RETAKE\n----------------------------------------------\nTest 1 average: 13.0\nTest 2 average: 12.5\nTest 3 average: 13.5\n\nHighest total: Aisha 55\nHardest test: 2\n```\n(Figure 1)\n\nOpen Q12 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q12FINISHED with the correct file extension for the programming language.",
  "starter": "# Q12\n\ntbl_results = [[\"Priya\", 17, 15, 19],\n               [\"Jonah\", 8, 11, 6],\n               [\"Mei\", 14, 18, 16],\n               [\"Tomas\", 12, 9, 13],\n               [\"Aisha\", 20, 17, 18],\n               [\"Luca\", 7, 5, 9]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q12.py",
  "solution": "# Q12\n\ntbl_results = [[\"Priya\", 17, 15, 19],\n               [\"Jonah\", 8, 11, 6],\n               [\"Mei\", 14, 18, 16],\n               [\"Tomas\", 12, 9, 13],\n               [\"Aisha\", 20, 17, 18],\n               [\"Luca\", 7, 5, 9]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nTESTS = 3\nRETAKE_AT = 10\nLAYOUT = \"{:<8}{:>4}{:>4}{:>4}{:>8}{:>10}  {}\"\n\n\n# Returns the total of the marks in one row of the array\ndef row_total(row):\n    total = 0\n    for test in range(1, len(row)):\n        total = total + row[test]\n    return total\n\n\n# Display the results table\nprint(LAYOUT.format(\"Student\", \"T1\", \"T2\", \"T3\", \"Total\", \"Average\", \"\"))\nprint(\"-\" * 46)\n\nbest = 0\ntest_totals = [0] * TESTS\n\nfor student in range(len(tbl_results)):\n    row = tbl_results[student]\n    total = row_total(row)\n    average = total / TESTS\n\n    flag = \"\"\n    if average < RETAKE_AT:\n        flag = \"RETAKE\"\n\n    print(LAYOUT.format(row[0], row[1], row[2], row[3],\n                        total, round(average, 1), flag))\n\n    # Add this student's marks to the totals for each test\n    for test in range(TESTS):\n        test_totals[test] = test_totals[test] + row[test + 1]\n\n    if total > row_total(tbl_results[best]):\n        best = student\n\nprint(\"-\" * 46)\n\n# Averages for each test, and the hardest test\nhardest = 0\nfor test in range(TESTS):\n    average = test_totals[test] / len(tbl_results)\n    print(\"Test\", test + 1, \"average: {:.1f}\".format(average))\n    if test_totals[test] < test_totals[hardest]:\n        hardest = test\n\nprint()\nprint(\"Highest total:\", tbl_results[best][0], row_total(tbl_results[best]))\nprint(\"Hardest test:\", hardest + 1)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable or array for tracking the totals for each test (guidance: Initial values could be zero or the first student's marks)",
    "description": "Any variable or array for tracking the totals for each test"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A loop or expression that totals the marks in one row (guidance: Accept row[1] + row[2] + row[3])",
    "description": "A loop or expression that totals the marks in one row"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the array displayed (guidance: Disregard presence/lack of total or average)",
    "description": "Rows of the array displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare an average with the retake mark (guidance: < 10 or <= 9)",
    "description": "Relational operator used to compare an average with the retake mark"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Marks are accumulated for each test separately (guidance: The index must identify the test, not the student)",
    "description": "Marks are accumulated for each test separately"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Student with the highest total identified correctly (guidance: By any method except hard-coded)",
    "description": "Student with the highest total identified correctly"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Average for each test calculated correctly by any method (guidance: Divided by the number of students, not the number of tests)",
    "description": "Average for each test calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Hardest test identified correctly (guidance: Lowest average or lowest total both acceptable)",
    "description": "Hardest test identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable or array for tracking the totals for each test (guidance: Initial values could be zero or the first student's marks)\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A loop or expression that totals the marks in one row (guidance: Accept row[1] + row[2] + row[3])\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the array displayed (guidance: Disregard presence/lack of total or average)\nA6: Relational operator used to compare an average with the retake mark (guidance: < 10 or <= 9)\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Marks are accumulated for each test separately (guidance: The index must identify the test, not the student)\nA9: Student with the highest total identified correctly (guidance: By any method except hard-coded)\nA10: Average for each test calculated correctly by any method (guidance: Divided by the number of students, not the number of tests)\nA11: Hardest test identified correctly (guidance: Lowest average or lowest total both acceptable)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q13",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q13 Rainfall by quarter",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A weather station records the rainfall in four towns.\nThe readings are stored in a two-dimensional array.\nEach row holds the four quarterly totals for one town, in millimetres.\nTown names are stored in a separate array in the same order as the rows.\n\nThe code file contains these data structures:\n• tbl_town stores the town names.\n• tbl_rain stores one row of four quarterly rainfall totals for each town.\n\nThe program must:\n• allow a scientist to input a town name and a quarter number, then a corrected reading\n    – if the town is not in the array, an appropriate error message is given\n    – if the quarter is not 1, 2, 3 or 4, an appropriate error message is given\n    – otherwise the reading is replaced\n• display a table with:\n    – a header row and a dividing line\n    – each town and its four quarterly totals\n    – the yearly total for each town\n• display the total rainfall for each quarter across all towns\n• display the name of the wettest town\n\nFigure 1 shows the output from a working program.\n```\nTown: Brampton\nQuarter (1-4): 2\nCorrected rainfall in mm: 81\n\nTown          Q1    Q2    Q3    Q4     Year\n-------------------------------------------\nArdwick      182    94   121   205      602\nBrampton     143    81    99   168      491\nCaldale      256   131   164   288      839\nDenshaw      118    62    85   139      404\n-------------------------------------------\nAll towns    699   368   469   800     2336\n\nWettest town: Caldale\n```\n(Figure 1)\n\nOpen Q13 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q13FINISHED with the correct file extension for the programming language.",
  "starter": "# Q13\n\ntbl_town = [\"Ardwick\", \"Brampton\", \"Caldale\", \"Denshaw\"]\n\ntbl_rain = [[182, 94, 121, 205],\n            [143, 77, 99, 168],\n            [256, 131, 164, 288],\n            [118, 62, 85, 139]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q13.py",
  "solution": "# Q13\n\ntbl_town = [\"Ardwick\", \"Brampton\", \"Caldale\", \"Denshaw\"]\n\ntbl_rain = [[182, 94, 121, 205],\n            [143, 77, 99, 168],\n            [256, 131, 164, 288],\n            [118, 62, 85, 139]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nQUARTERS = 4\nLAYOUT = \"{:<10}{:>6}{:>6}{:>6}{:>6}{:>9}\"\n\n\n# Returns the yearly total for one row of the array\ndef year_total(row):\n    total = 0\n    for quarter in range(len(row)):\n        total = total + row[quarter]\n    return total\n\n\n# Correct one reading\nname = input(\"Town: \")\nquarter = int(input(\"Quarter (1-4): \"))\nreading = int(input(\"Corrected rainfall in mm: \"))\n\nfound = -1\nfor index in range(len(tbl_town)):\n    if tbl_town[index] == name:\n        found = index\n\nif found == -1:\n    print(\"Town not found\")\nelif quarter < 1 or quarter > QUARTERS:\n    print(\"Quarter must be 1, 2, 3 or 4\")\nelse:\n    tbl_rain[found][quarter - 1] = reading\n\n# Display the rainfall table\nprint()\nprint(LAYOUT.format(\"Town\", \"Q1\", \"Q2\", \"Q3\", \"Q4\", \"Year\"))\nprint(\"-\" * 43)\n\nquarter_totals = [0] * QUARTERS\nwettest = 0\n\nfor index in range(len(tbl_town)):\n    row = tbl_rain[index]\n    print(LAYOUT.format(tbl_town[index], row[0], row[1],\n                        row[2], row[3], year_total(row)))\n\n    # Add this town's rainfall to the total for each quarter\n    for quarter in range(QUARTERS):\n        quarter_totals[quarter] = quarter_totals[quarter] + row[quarter]\n\n    if year_total(row) > year_total(tbl_rain[wettest]):\n        wettest = index\n\nprint(\"-\" * 43)\nprint(LAYOUT.format(\"All towns\", quarter_totals[0], quarter_totals[1],\n                    quarter_totals[2], quarter_totals[3],\n                    year_total(quarter_totals)))\nprint()\nprint(\"Wettest town:\", tbl_town[wettest])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The quarter number is checked against the number of columns (guidance: Accept a fixed value of 4)",
    "description": "The quarter number is checked against the number of columns"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A loop or expression that totals one row of the array",
    "description": "A loop or expression that totals one row of the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the array displayed (guidance: Disregard presence/lack of the yearly total)",
    "description": "Rows of the array displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input town with the array",
    "description": "Relational operator used to compare the input town with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the town is not found (guidance: Any suitable message)",
    "description": "Error message displayed when the town is not found"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The correct element of the two-dimensional array is replaced (guidance: Both the row and the column must be identified)",
    "description": "The correct element of the two-dimensional array is replaced"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Totals accumulated for each quarter separately (guidance: The index must identify the quarter, not the town)",
    "description": "Totals accumulated for each quarter separately"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Wettest town identified correctly (guidance: By any method except hard-coded)",
    "description": "Wettest town identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The quarter number is checked against the number of columns (guidance: Accept a fixed value of 4)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: A loop or expression that totals one row of the array\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the array displayed (guidance: Disregard presence/lack of the yearly total)\nA6: Relational operator used to compare the input town with the array\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed when the town is not found (guidance: Any suitable message)\nA9: The correct element of the two-dimensional array is replaced (guidance: Both the row and the column must be identified)\nA10: Totals accumulated for each quarter separately (guidance: The index must identify the quarter, not the town)\nA11: Wettest town identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q14",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q14 Car park bays",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A multi-storey car park records which bays are in use.\nThe bays are stored in a two-dimensional array with one row for each level.\nA free bay is stored as an empty string and a bay in use stores the car's registration.\n\nThe code file contains these data structures:\n• tbl_level stores the name of each level.\n• tbl_bays stores the bays, one row for each level.\n\nThe program must:\n• allow an attendant to input a registration\n    – the car is parked in the first free bay, searching level by level\n    – the level and bay number are displayed\n    – if there are no free bays, an appropriate message is displayed\n• display a table with:\n    – a header row and a dividing line\n    – each level, the number of bays in use, the number free and the percentage full as a whole number\n• display the total number of free bays in the whole car park\n• display the name of the level that is the fullest\n\nFigure 1 shows the output from a working program.\n```\nRegistration: XF24 PLM\nParked on Ground level, bay 2\n\nLevel      In use   Free   Full %\n---------------------------------\nGround          4      1       80\nFirst           1      4       20\nSecond          5      0      100\n---------------------------------\nFree bays in total: 5\nFullest level: Second\n```\n(Figure 1)\n\nOpen Q14 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q14FINISHED with the correct file extension for the programming language.",
  "starter": "# Q14\n\ntbl_level = [\"Ground\", \"First\", \"Second\"]\n\ntbl_bays = [[\"LT21 KFG\", \"\", \"MN19 ODB\", \"PV70 XRC\", \"\"],\n            [\"\", \"\", \"RE22 TYU\", \"\", \"\"],\n            [\"SA68 LMN\", \"TB71 QWE\", \"UC19 ZXC\", \"VD23 ASD\", \"WE70 FGH\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q14.py",
  "solution": "# Q14\n\ntbl_level = [\"Ground\", \"First\", \"Second\"]\n\ntbl_bays = [[\"LT21 KFG\", \"\", \"MN19 ODB\", \"PV70 XRC\", \"\"],\n            [\"\", \"\", \"RE22 TYU\", \"\", \"\"],\n            [\"SA68 LMN\", \"TB71 QWE\", \"UC19 ZXC\", \"VD23 ASD\", \"WE70 FGH\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nFREE = \"\"\nLAYOUT = \"{:<9}{:>8}{:>7}{:>9}\"\n\n\n# Returns how many bays on one level are in use\ndef bays_used(level):\n    used = 0\n    for bay in range(len(level)):\n        if level[bay] != FREE:\n            used = used + 1\n    return used\n\n\n# Park a car in the first free bay\nregistration = input(\"Registration: \")\n\nparked = False\nfor row in range(len(tbl_bays)):\n    for bay in range(len(tbl_bays[row])):\n        if tbl_bays[row][bay] == FREE and not parked:\n            tbl_bays[row][bay] = registration\n            print(\"Parked on\", tbl_level[row], \"level, bay\", bay + 1)\n            parked = True\n\nif not parked:\n    print(\"Sorry, the car park is full\")\n\n# Display the level table\nprint()\nprint(LAYOUT.format(\"Level\", \"In use\", \"Free\", \"Full %\"))\nprint(\"-\" * 33)\n\ntotal_free = 0\nfullest = 0\n\nfor row in range(len(tbl_bays)):\n    used = bays_used(tbl_bays[row])\n    free = len(tbl_bays[row]) - used\n    total_free = total_free + free\n\n    print(LAYOUT.format(tbl_level[row], used, free,\n                        round(used / len(tbl_bays[row]) * 100)))\n\n    if used > bays_used(tbl_bays[fullest]):\n        fullest = row\n\nprint(\"-\" * 33)\nprint(\"Free bays in total:\", total_free)\nprint(\"Fullest level:\", tbl_level[fullest])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A flag or equivalent records whether the car has been parked (guidance: Accept break, return or a sentinel value)",
    "description": "A flag or equivalent records whether the car has been parked"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "Nested loops to all bays on all levels (guidance: Any loop type)",
    "description": "Nested loops to all bays on all levels"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A loop to all bays on one level",
    "description": "A loop to all bays on one level"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "One row displayed for each level (guidance: Disregard presence/lack of the percentage)",
    "description": "One row displayed for each level"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to test whether a bay is free (guidance: Comparison with an empty string, or a length test)",
    "description": "Relational operator used to test whether a bay is free"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A message is displayed when there are no free bays (guidance: Must not display both a bay number and the full message)",
    "description": "A message is displayed when there are no free bays"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The registration is written into the first free bay only (guidance: No mark if the car is parked in every free bay)",
    "description": "The registration is written into the first free bay only"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total free bays calculated correctly after parking the car",
    "description": "Total free bays calculated correctly after parking the car"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Fullest level identified correctly (guidance: By any method except hard-coded)",
    "description": "Fullest level identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A flag or equivalent records whether the car has been parked (guidance: Accept break, return or a sentinel value)\nA2: Nested loops to all bays on all levels (guidance: Any loop type)\nA3: A loop to all bays on one level\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: One row displayed for each level (guidance: Disregard presence/lack of the percentage)\nA6: Relational operator used to test whether a bay is free (guidance: Comparison with an empty string, or a length test)\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: A message is displayed when there are no free bays (guidance: Must not display both a bay number and the full message)\nA9: The registration is written into the first free bay only (guidance: No mark if the car is parked in every free bay)\nA10: Total free bays calculated correctly after parking the car\nA11: Fullest level identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q15",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q15 Football league table",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A junior football league stores its results in a two-dimensional array.\nEach row holds a team name followed by the number of games won, drawn and lost.\nA win is worth 3 points and a draw is worth 1 point. A loss is worth no points.\n\nThe code file contains these data structures:\n• tbl_league stores one row for each team: name, won, drawn, lost.\n\nThe program must:\n• allow a league secretary to input a team name and the result of a new game, entered as W, D or L\n    – if the team is not in the array, an appropriate error message is given\n    – if the result is not W, D or L, an appropriate error message is given\n    – otherwise the team's record is updated\n• display a table with:\n    – a header row and a dividing line\n    – each team, its games won, drawn and lost, its games played and its points\n• display the total number of games played in the league\n• display the name of the team at the top of the league\nEach game in the league appears on the record of both teams, so the number of games played in the league is half the total of the games played.\n\nFigure 1 shows the output from a working program.\n```\nTeam: Albion\nResult (W/D/L): W\n\nTeam          W   D   L  Played  Points\n---------------------------------------\nRovers        7   2   1      10      23\nUnited        5   4   1      10      19\nAlbion        4   3   4      11      15\nAthletic      8   1   1      10      25\nWanderers     1   2   7      10       5\n---------------------------------------\nGames played in the league: 25\nTop of the league: Athletic\n```\n(Figure 1)\n\nOpen Q15 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q15FINISHED with the correct file extension for the programming language.",
  "starter": "# Q15\n\ntbl_league = [[\"Rovers\", 7, 2, 1],\n              [\"United\", 5, 4, 1],\n              [\"Albion\", 3, 3, 4],\n              [\"Athletic\", 8, 1, 1],\n              [\"Wanderers\", 1, 2, 7]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q15.py",
  "solution": "# Q15\n\ntbl_league = [[\"Rovers\", 7, 2, 1],\n              [\"United\", 5, 4, 1],\n              [\"Albion\", 3, 3, 4],\n              [\"Athletic\", 8, 1, 1],\n              [\"Wanderers\", 1, 2, 7]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nWIN_POINTS = 3\nDRAW_POINTS = 1\nWON = 1\nDRAWN = 2\nLOST = 3\nLAYOUT = \"{:<11}{:>4}{:>4}{:>4}{:>8}{:>8}\"\n\n\n# Returns the points earned by one row of the league\ndef points_for(row):\n    return row[WON] * WIN_POINTS + row[DRAWN] * DRAW_POINTS\n\n\n# Returns the number of games one row has played\ndef played_by(row):\n    return row[WON] + row[DRAWN] + row[LOST]\n\n\n# Record a new result\nteam = input(\"Team: \")\nresult = input(\"Result (W/D/L): \")\n\nfound = -1\nfor index in range(len(tbl_league)):\n    if tbl_league[index][0] == team:\n        found = index\n\nif found == -1:\n    print(\"Team not in the league\")\nelif result == \"W\":\n    tbl_league[found][WON] = tbl_league[found][WON] + 1\nelif result == \"D\":\n    tbl_league[found][DRAWN] = tbl_league[found][DRAWN] + 1\nelif result == \"L\":\n    tbl_league[found][LOST] = tbl_league[found][LOST] + 1\nelse:\n    print(\"Result must be W, D or L\")\n\n# Display the league table\nprint()\nprint(LAYOUT.format(\"Team\", \"W\", \"D\", \"L\", \"Played\", \"Points\"))\nprint(\"-\" * 39)\n\nall_games = 0\ntop = 0\n\nfor index in range(len(tbl_league)):\n    row = tbl_league[index]\n    print(LAYOUT.format(row[0], row[WON], row[DRAWN], row[LOST],\n                        played_by(row), points_for(row)))\n\n    all_games = all_games + played_by(row)\n\n    if points_for(row) > points_for(tbl_league[top]):\n        top = index\n\nprint(\"-\" * 39)\nprint(\"Games played in the league:\", all_games // 2)\nprint(\"Top of the league:\", tbl_league[top][0])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Selection on the result entered (guidance: if/elif or equivalent on W, D and L)",
    "description": "Selection on the result entered"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Points calculated as won * 3 + drawn * 1",
    "description": "Points calculated as won * 3 + drawn * 1"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the array displayed (guidance: Disregard presence/lack of played or points)",
    "description": "Rows of the array displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "The team name is compared with the first element of each row (guidance: Indexing must select the name, not the whole row)",
    "description": "The team name is compared with the first element of each row"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the team is not in the league (guidance: Any suitable message)",
    "description": "Error message displayed when the team is not in the league"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The correct element of the row is increased by one (guidance: Only one of won, drawn or lost is changed)",
    "description": "The correct element of the row is increased by one"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Games played in the league calculated correctly (guidance: Total of all games divided by two, by any method)",
    "description": "Games played in the league calculated correctly"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Team at the top identified correctly by points (guidance: By any method except hard-coded)",
    "description": "Team at the top identified correctly by points"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Selection on the result entered (guidance: if/elif or equivalent on W, D and L)\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: Points calculated as won * 3 + drawn * 1\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the array displayed (guidance: Disregard presence/lack of played or points)\nA6: The team name is compared with the first element of each row (guidance: Indexing must select the name, not the whole row)\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: Error message displayed when the team is not in the league (guidance: Any suitable message)\nA9: The correct element of the row is increased by one (guidance: Only one of won, drawn or lost is changed)\nA10: Games played in the league calculated correctly (guidance: Total of all games divided by two, by any method)\nA11: Team at the top identified correctly by points (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q16",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q16 Zoo feeding chart",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A zoo records how much food each animal is given on each day of a five day week.\nThe amounts are stored in a two-dimensional array in kilograms.\nEach row holds the five daily amounts for one animal.\nAnimal names are stored in a separate array in the same order as the rows.\n\nThe code file contains these data structures:\n• tbl_animal stores the animal names.\n• tbl_food stores one row of five daily amounts for each animal.\n• tbl_day stores the names of the days.\n\nThe program must:\n• display a table with:\n    – a header row of day names and a dividing line\n    – each animal and its five daily amounts\n    – the weekly total for each animal\n• display the total food used on each day\n• display the name of the animal that eats the most in a week\n• display the busiest day, which is the day the most food is used\n• display the average amount of food used per day to 1 decimal place\n\nFigure 1 shows the output from a working program.\n```\nAnimal     Mon   Tue   Wed   Thu   Fri     Week\n-----------------------------------------------\nLion       8.5   9.0   8.0   9.5   8.5     43.5\nTapir      4.0   4.5   4.0   4.0   4.5     21.0\nMacaw      0.5   0.5   0.6   0.5   0.4      2.5\nOtter      2.5   2.0   2.5   3.0   2.5     12.5\n-----------------------------------------------\nAll       15.5  16.0  15.1  17.0  15.9     79.5\n\nEats the most: Lion\nBusiest day: Thu\nAverage per day: 15.9 kg\n```\n(Figure 1)\n\nOpen Q16 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q16FINISHED with the correct file extension for the programming language.",
  "starter": "# Q16\n\ntbl_animal = [\"Lion\", \"Tapir\", \"Macaw\", \"Otter\"]\ntbl_day = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\n\ntbl_food = [[8.5, 9.0, 8.0, 9.5, 8.5],\n            [4.0, 4.5, 4.0, 4.0, 4.5],\n            [0.5, 0.5, 0.6, 0.5, 0.4],\n            [2.5, 2.0, 2.5, 3.0, 2.5]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q16.py",
  "solution": "# Q16\n\ntbl_animal = [\"Lion\", \"Tapir\", \"Macaw\", \"Otter\"]\ntbl_day = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\n\ntbl_food = [[8.5, 9.0, 8.0, 9.5, 8.5],\n            [4.0, 4.5, 4.0, 4.0, 4.5],\n            [0.5, 0.5, 0.6, 0.5, 0.4],\n            [2.5, 2.0, 2.5, 3.0, 2.5]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<8}{:>6}{:>6}{:>6}{:>6}{:>6}{:>9}\"\n\n\n# Returns the total of one row of the array\ndef row_total(row):\n    total = 0.0\n    for day in range(len(row)):\n        total = total + row[day]\n    return total\n\n\n# Display the feeding chart\nprint(LAYOUT.format(\"Animal\", tbl_day[0], tbl_day[1], tbl_day[2],\n                    tbl_day[3], tbl_day[4], \"Week\"))\nprint(\"-\" * 47)\n\nday_totals = [0.0] * len(tbl_day)\ngreediest = 0\n\nfor index in range(len(tbl_animal)):\n    row = tbl_food[index]\n    print(LAYOUT.format(tbl_animal[index], row[0], row[1],\n                        row[2], row[3], row[4], round(row_total(row), 1)))\n\n    # Add this animal's food to the total for each day\n    for day in range(len(row)):\n        day_totals[day] = day_totals[day] + row[day]\n\n    if row_total(row) > row_total(tbl_food[greediest]):\n        greediest = index\n\nprint(\"-\" * 47)\nprint(LAYOUT.format(\"All\", round(day_totals[0], 1), round(day_totals[1], 1),\n                    round(day_totals[2], 1), round(day_totals[3], 1),\n                    round(day_totals[4], 1), round(row_total(day_totals), 1)))\n\n# Find the busiest day\nbusiest = 0\nfor day in range(len(day_totals)):\n    if day_totals[day] > day_totals[busiest]:\n        busiest = day\n\nprint()\nprint(\"Eats the most:\", tbl_animal[greediest])\nprint(\"Busiest day:\", tbl_day[busiest])\nprint(\"Average per day: {:.1f} kg\".format(\n    row_total(day_totals) / len(tbl_day)))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable or array for tracking the totals for each day (guidance: Initial values could be zero or the first animal's amounts)",
    "description": "Any variable or array for tracking the totals for each day"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A loop or expression that totals one row of the array",
    "description": "A loop or expression that totals one row of the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row of day names and a dividing line displayed (guidance: Day names must come from the array, not be typed again)",
    "description": "Header row of day names and a dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the array displayed (guidance: Disregard presence/lack of the weekly total)",
    "description": "Rows of the array displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare one day's total with another",
    "description": "Relational operator used to compare one day's total with another"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Totals accumulated for each day separately (guidance: The index must identify the day, not the animal)",
    "description": "Totals accumulated for each day separately"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Animal eating the most identified correctly (guidance: By any method except hard-coded)",
    "description": "Animal eating the most identified correctly"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Busiest day identified correctly (guidance: By any method except hard-coded)",
    "description": "Busiest day identified correctly"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Average food per day calculated correctly by any method (guidance: Divided by the number of days)",
    "description": "Average food per day calculated correctly by any method"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable or array for tracking the totals for each day (guidance: Initial values could be zero or the first animal's amounts)\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A loop or expression that totals one row of the array\nA4: Header row of day names and a dividing line displayed (guidance: Day names must come from the array, not be typed again)\nA5: Rows of the array displayed (guidance: Disregard presence/lack of the weekly total)\nA6: Relational operator used to compare one day's total with another\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Totals accumulated for each day separately (guidance: The index must identify the day, not the animal)\nA9: Animal eating the most identified correctly (guidance: By any method except hard-coded)\nA10: Busiest day identified correctly (guidance: By any method except hard-coded)\nA11: Average food per day calculated correctly by any method (guidance: Divided by the number of days)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q17",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q17 Pizza orders",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A takeaway works out the price of each pizza it sells.\nThe order is stored in a two-dimensional array.\nEach row holds the size of a pizza and the number of extra toppings on it.\nA base price is charged for the size, plus 90p for each extra topping.\nAn order of five or more pizzas gets 10% off the whole order.\n\nThe code file contains these data structures:\n• tbl_order stores one row for each pizza: size, number of extra toppings.\n• tbl_size stores the size names.\n• tbl_base stores the base price of each size, in the same order as tbl_size.\n\nThe program must:\n• calculate the price of each pizza using a subprogram\n• display an itemised bill with:\n    – a header row and a dividing line\n    – each pizza, its size, its extra toppings and its price\n    – a message for any size that is not in tbl_size, and that pizza is not charged for\n• display the order total before any discount\n• display the discount given, which may be zero\n• display the amount to pay\nThe price of one pizza is the base price for its size plus 0.90 for each extra topping.\n\nFigure 1 shows the output from a working program.\n```\nNo.   Size      Toppings    Price\n---------------------------------\n1     Medium           2   £10.55\n2     Large            0   £11.00\n3     Small            4   £10.10\n4     Giant            1  unknown\n5     Large            3   £13.70\n6     Medium           1    £9.65\n---------------------------------\nOrder total: £55.00\nDiscount: £5.50\nTo pay: £49.50\n```\n(Figure 1)\n\nOpen Q17 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q17FINISHED with the correct file extension for the programming language.",
  "starter": "# Q17\n\ntbl_size = [\"Small\", \"Medium\", \"Large\"]\ntbl_base = [6.50, 8.75, 11.00]\n\ntbl_order = [[\"Medium\", 2],\n             [\"Large\", 0],\n             [\"Small\", 4],\n             [\"Giant\", 1],\n             [\"Large\", 3],\n             [\"Medium\", 1]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q17.py",
  "solution": "# Q17\n\ntbl_size = [\"Small\", \"Medium\", \"Large\"]\ntbl_base = [6.50, 8.75, 11.00]\n\ntbl_order = [[\"Medium\", 2],\n             [\"Large\", 0],\n             [\"Small\", 4],\n             [\"Giant\", 1],\n             [\"Large\", 3],\n             [\"Medium\", 1]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nTOPPING_COST = 0.90\nDISCOUNT_FROM = 5\nDISCOUNT_RATE = 0.10\nLAYOUT = \"{:<6}{:<9}{:>9}{:>9}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the price of one pizza, or -1 when the size is unknown\ndef price_of(size, toppings):\n    for index in range(len(tbl_size)):\n        if tbl_size[index] == size:\n            return tbl_base[index] + toppings * TOPPING_COST\n    return -1\n\n\n# Display the itemised bill\nprint(LAYOUT.format(\"No.\", \"Size\", \"Toppings\", \"Price\"))\nprint(\"-\" * 33)\n\ntotal = 0.0\ncharged = 0\n\nfor index in range(len(tbl_order)):\n    size = tbl_order[index][0]\n    toppings = tbl_order[index][1]\n    price = price_of(size, toppings)\n\n    if price == -1:\n        print(LAYOUT.format(index + 1, size, toppings, \"unknown\"))\n    else:\n        print(LAYOUT.format(index + 1, size, toppings, money(price)))\n        total = total + price\n        charged = charged + 1\n\nprint(\"-\" * 33)\nprint(\"Order total:\", money(total))\n\n# Work out the discount\ndiscount = 0.0\nif charged >= DISCOUNT_FROM:\n    discount = total * DISCOUNT_RATE\n\nprint(\"Discount:\", money(discount))\nprint(\"To pay:\", money(total - discount))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A value is returned or set to show that a size is unknown (guidance: Accept -1, zero or a flag)",
    "description": "A value is returned or set to show that a size is unknown"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Price calculated as base price + toppings * 0.90 (guidance: Accept pence throughout)",
    "description": "Price calculated as base price + toppings * 0.90"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the order displayed (guidance: Disregard presence/lack of the price)",
    "description": "Rows of the order displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare a size with the sizes available",
    "description": "Relational operator used to compare a size with the sizes available"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to price one pizza (guidance: Must return the price or set a variable the main program uses)",
    "description": "A subprogram is defined and called to price one pizza"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A message is displayed for a size that is not available (guidance: Any suitable message)",
    "description": "A message is displayed for a size that is not available"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Only pizzas with a known size are added to the total",
    "description": "Only pizzas with a known size are added to the total"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The discount is applied only when five or more pizzas are charged for (guidance: >= 5 or > 4; must count charged pizzas, not rows)",
    "description": "The discount is applied only when five or more pizzas are charged for"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Amount to pay calculated as the total minus the discount",
    "description": "Amount to pay calculated as the total minus the discount"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A value is returned or set to show that a size is unknown (guidance: Accept -1, zero or a flag)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Price calculated as base price + toppings * 0.90 (guidance: Accept pence throughout)\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the order displayed (guidance: Disregard presence/lack of the price)\nA6: Relational operator used to compare a size with the sizes available\nA7: A subprogram is defined and called to price one pizza (guidance: Must return the price or set a variable the main program uses)\nA8: A message is displayed for a size that is not available (guidance: Any suitable message)\nA9: Only pizzas with a known size are added to the total\nA10: The discount is applied only when five or more pizzas are charged for (guidance: >= 5 or > 4; must count charged pizzas, not rows)\nA11: Amount to pay calculated as the total minus the discount\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q18",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q18 Theatre ticket zones",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A theatre divides its seats into price zones.\nThe zone of every seat is stored in a two-dimensional array.\nEach row of the array is a row of seats and each entry is the zone letter for that seat.\nA separate pair of arrays holds the zone letters and the price of a seat in that zone.\n\nThe code file contains these data structures:\n• tbl_plan stores the zone letter of every seat.\n• tbl_zone stores the zone letters.\n• tbl_zone_price stores the price for each zone, in the same order as tbl_zone.\n\nThe program must:\n• allow a customer to input how many tickets they want and a zone letter\n    – if the zone letter is not in tbl_zone, an appropriate error message is given\n    – if there are not enough seats in that zone, an appropriate error message is given\n    – otherwise the cost of the tickets is displayed\n• display a table with:\n    – a header row and a dividing line\n    – each zone, its price, how many seats it has and the value of all those seats\n• display how many seats the theatre has in total\n• display the value of the whole theatre if every seat were sold\n\nFigure 1 shows the output from a working program.\n```\nHow many tickets: 4\nZone letter: B\n4 tickets cost £114.00\n\nZone      Price   Seats       Value\n-----------------------------------\nA        £42.00      10     £420.00\nB        £28.50      10     £285.00\nC        £16.00      10     £160.00\n-----------------------------------\nSeats in the theatre: 30\nValue of a full house: £865.00\n```\n(Figure 1)\n\nOpen Q18 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q18FINISHED with the correct file extension for the programming language.",
  "starter": "# Q18\n\ntbl_zone = [\"A\", \"B\", \"C\"]\ntbl_zone_price = [42.00, 28.50, 16.00]\n\ntbl_plan = [[\"A\", \"A\", \"A\", \"A\", \"A\", \"A\"],\n            [\"A\", \"A\", \"B\", \"B\", \"A\", \"A\"],\n            [\"B\", \"B\", \"B\", \"B\", \"B\", \"B\"],\n            [\"C\", \"C\", \"B\", \"B\", \"C\", \"C\"],\n            [\"C\", \"C\", \"C\", \"C\", \"C\", \"C\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q18.py",
  "solution": "# Q18\n\ntbl_zone = [\"A\", \"B\", \"C\"]\ntbl_zone_price = [42.00, 28.50, 16.00]\n\ntbl_plan = [[\"A\", \"A\", \"A\", \"A\", \"A\", \"A\"],\n            [\"A\", \"A\", \"B\", \"B\", \"A\", \"A\"],\n            [\"B\", \"B\", \"B\", \"B\", \"B\", \"B\"],\n            [\"C\", \"C\", \"B\", \"B\", \"C\", \"C\"],\n            [\"C\", \"C\", \"C\", \"C\", \"C\", \"C\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<6}{:>9}{:>8}{:>12}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns how many seats in the plan belong to one zone\ndef seats_in(letter):\n    count = 0\n    for row in range(len(tbl_plan)):\n        for seat in range(len(tbl_plan[row])):\n            if tbl_plan[row][seat] == letter:\n                count = count + 1\n    return count\n\n\n# Sell some tickets\nwanted = int(input(\"How many tickets: \"))\nletter = input(\"Zone letter: \")\n\nposition = -1\nfor index in range(len(tbl_zone)):\n    if tbl_zone[index] == letter:\n        position = index\n\nif position == -1:\n    print(\"No such zone\")\nelif wanted > seats_in(letter):\n    print(\"Only\", seats_in(letter), \"seats in zone\", letter)\nelse:\n    print(wanted, \"tickets cost\", money(wanted * tbl_zone_price[position]))\n\n# Display the zone table\nprint()\nprint(LAYOUT.format(\"Zone\", \"Price\", \"Seats\", \"Value\"))\nprint(\"-\" * 35)\n\nall_seats = 0\nall_value = 0.0\n\nfor index in range(len(tbl_zone)):\n    count = seats_in(tbl_zone[index])\n    value = count * tbl_zone_price[index]\n\n    print(LAYOUT.format(tbl_zone[index], money(tbl_zone_price[index]),\n                        count, money(value)))\n\n    all_seats = all_seats + count\n    all_value = all_value + value\n\nprint(\"-\" * 35)\nprint(\"Seats in the theatre:\", all_seats)\nprint(\"Value of a full house:\", money(all_value))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A variable records the position of the zone, or that it was not found (guidance: Accept -1, a flag or a return value)",
    "description": "A variable records the position of the zone, or that it was not found"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A nested loop to all seats in a row",
    "description": "A nested loop to all seats in a row"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row and dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row and dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "One row displayed for each zone (guidance: Disregard presence/lack of the value column)",
    "description": "One row displayed for each zone"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare a seat with a zone letter",
    "description": "Relational operator used to compare a seat with a zone letter"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to count the seats in a zone (guidance: Must return the count)",
    "description": "A subprogram is defined and called to count the seats in a zone"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the zone letter does not exist (guidance: Any suitable message)",
    "description": "Error message displayed when the zone letter does not exist"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Error message displayed when too many tickets are requested (guidance: Must compare with the seats in that zone only)",
    "description": "Error message displayed when too many tickets are requested"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Value of a zone calculated as seats * price",
    "description": "Value of a zone calculated as seats * price"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Value of a full house calculated correctly by any method",
    "description": "Value of a full house calculated correctly by any method"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A variable records the position of the zone, or that it was not found (guidance: Accept -1, a flag or a return value)\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A nested loop to all seats in a row\nA4: Header row and dividing line displayed (guidance: Any sensible headings)\nA5: One row displayed for each zone (guidance: Disregard presence/lack of the value column)\nA6: Relational operator used to compare a seat with a zone letter\nA7: A subprogram is defined and called to count the seats in a zone (guidance: Must return the count)\nA8: Error message displayed when the zone letter does not exist (guidance: Any suitable message)\nA9: Error message displayed when too many tickets are requested (guidance: Must compare with the seats in that zone only)\nA10: Value of a zone calculated as seats * price\nA11: Value of a full house calculated correctly by any method\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q19",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q19 Noughts and crosses",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A program stores the state of a noughts and crosses board.\nThe board is stored in a two-dimensional array of three rows and three columns.\nAn empty square is stored as a space, and a played square stores X or O.\n\nThe code file contains these data structures:\n• tbl_board stores the squares of the board.\n\nThe program must:\n• display the board with:\n    – a column number along the top\n    – a row number at the start of each line\n    – the contents of each square\n• allow a player to input a row number, a column number and their symbol\n    – if the row or column is not 1, 2 or 3, an appropriate error message is given\n    – if the square is already taken, an appropriate error message is given\n    – otherwise the square is played and the new board is displayed\n• use a subprogram to test whether a symbol has won by filling a whole row or a whole column\n• display either the winning symbol or a message that there is no winner yet\n• display how many empty squares are left\n\nFigure 1 shows the output from a working program.\n```\n   1 2 3\n1  X O X \n2    X O \n3  O     \n\nRow (1-3): 3\nColumn (1-3): 2\nSymbol (X/O): X\n\n   1 2 3\n1  X O X \n2    X O \n3  O X   \n\nNo winner yet\nEmpty squares: 2\n```\n(Figure 1)\n\nOpen Q19 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q19FINISHED with the correct file extension for the programming language.",
  "starter": "# Q19\n\ntbl_board = [[\"X\", \"O\", \"X\"],\n             [\" \", \"X\", \"O\"],\n             [\"O\", \" \", \" \"]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q19.py",
  "solution": "# Q19\n\ntbl_board = [[\"X\", \"O\", \"X\"],\n             [\" \", \"X\", \"O\"],\n             [\"O\", \" \", \" \"]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nEMPTY = \" \"\nSIZE = 3\n\n\n# Displays the board with row and column numbers\ndef show_board(board):\n    print(\"   1 2 3\")\n    for row in range(len(board)):\n        line = str(row + 1) + \"  \"\n        for column in range(len(board[row])):\n            line = line + board[row][column] + \" \"\n        print(line)\n\n\n# Returns True when a symbol fills a whole row or a whole column\ndef has_won(board, symbol):\n    for row in range(SIZE):\n        if board[row][0] == symbol and board[row][1] == symbol \\\n                and board[row][2] == symbol:\n            return True\n    for column in range(SIZE):\n        if board[0][column] == symbol and board[1][column] == symbol \\\n                and board[2][column] == symbol:\n            return True\n    return False\n\n\n# Show the board as it stands\nshow_board(tbl_board)\nprint()\n\n# Take a go\nrow = int(input(\"Row (1-3): \"))\ncolumn = int(input(\"Column (1-3): \"))\nsymbol = input(\"Symbol (X/O): \")\n\nif row < 1 or row > SIZE or column < 1 or column > SIZE:\n    print(\"That square is not on the board\")\nelif tbl_board[row - 1][column - 1] != EMPTY:\n    print(\"That square is already taken\")\nelse:\n    tbl_board[row - 1][column - 1] = symbol\n    print()\n    show_board(tbl_board)\n\n# Report the result\nprint()\nif has_won(tbl_board, \"X\"):\n    print(\"X has won\")\nelif has_won(tbl_board, \"O\"):\n    print(\"O has won\")\nelse:\n    print(\"No winner yet\")\n\nempty = 0\nfor row in range(SIZE):\n    for column in range(SIZE):\n        if tbl_board[row][column] == EMPTY:\n            empty = empty + 1\n\nprint(\"Empty squares:\", empty)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Error messages for an off-board square and for a taken square are separate (guidance: Both conditions must be tested)",
    "description": "Error messages for an off-board square and for a taken square are separate"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A nested loop to all columns in a row",
    "description": "A nested loop to all columns in a row"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The board is displayed one row per line",
    "description": "The board is displayed one row per line"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The array is updated with the symbol played",
    "description": "The array is updated with the symbol played"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to test that the row and column are on the board (guidance: Both ends of both ranges must be tested)",
    "description": "Relational operators used to test that the row and column are on the board"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to display the board",
    "description": "A subprogram is defined and called to display the board"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A win across a row is detected (guidance: Any method, including a count of matches)",
    "description": "A win across a row is detected"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "A win down a column is detected (guidance: The index must vary the row, not the column)",
    "description": "A win down a column is detected"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The winning symbol, or a no winner message, is displayed (guidance: Must test both symbols)",
    "description": "The winning symbol, or a no winner message, is displayed"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Empty squares counted correctly after the go (guidance: Must reflect the new symbol)",
    "description": "Empty squares counted correctly after the go"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Error messages for an off-board square and for a taken square are separate (guidance: Both conditions must be tested)\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A nested loop to all columns in a row\nA4: The board is displayed one row per line\nA5: The array is updated with the symbol played\nA6: Relational operators used to test that the row and column are on the board (guidance: Both ends of both ranges must be tested)\nA7: A subprogram is defined and called to display the board\nA8: A win across a row is detected (guidance: Any method, including a count of matches)\nA9: A win down a column is detected (guidance: The index must vary the row, not the column)\nA10: The winning symbol, or a no winner message, is displayed (guidance: Must test both symbols)\nA11: Empty squares counted correctly after the go (guidance: Must reflect the new symbol)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q20",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q20 Sales by region",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A company records its sales in four regions over three months.\nThe sales are stored in a two-dimensional array in thousands of pounds.\nEach row holds the three monthly figures for one region.\nA region meets its target if its sales grow every month.\n\nThe code file contains these data structures:\n• tbl_region stores the region names.\n• tbl_month stores the month names.\n• tbl_sales stores one row of three monthly figures for each region.\n\nThe program must:\n• display a table with:\n    – a header row of month names and a dividing line\n    – each region and its three monthly figures\n    – the quarter total for each region\n    – the word GROWING beside each region whose sales grew every month\n• display the total sales in each month\n• display the name of the best region in the quarter\n• display the change from the first month to the last as a percentage to 1 decimal place\n\nFigure 1 shows the output from a working program.\n```\nRegion     Jan   Feb   Mar  Quarter  \n--------------------------------------------\nNorth      128   134   141      403  GROWING\nSouth       96    92    88      276  \nEast       152   149   163      464  \nWest        77    85    94      256  GROWING\n--------------------------------------------\nAll        453   460   486     1399  \n\nBest region: East\nChange over the quarter: 7.3%\n```\n(Figure 1)\n\nOpen Q20 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q20FINISHED with the correct file extension for the programming language.",
  "starter": "# Q20\n\ntbl_region = [\"North\", \"South\", \"East\", \"West\"]\ntbl_month = [\"Jan\", \"Feb\", \"Mar\"]\n\ntbl_sales = [[128, 134, 141],\n             [96, 92, 88],\n             [152, 149, 163],\n             [77, 85, 94]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q20.py",
  "solution": "# Q20\n\ntbl_region = [\"North\", \"South\", \"East\", \"West\"]\ntbl_month = [\"Jan\", \"Feb\", \"Mar\"]\n\ntbl_sales = [[128, 134, 141],\n             [96, 92, 88],\n             [152, 149, 163],\n             [77, 85, 94]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<8}{:>6}{:>6}{:>6}{:>9}  {}\"\n\n\n# Returns the total of one row of the array\ndef row_total(row):\n    total = 0\n    for month in range(len(row)):\n        total = total + row[month]\n    return total\n\n\n# Returns True when every figure in a row is bigger than the one before\ndef is_growing(row):\n    growing = True\n    for month in range(1, len(row)):\n        if row[month] <= row[month - 1]:\n            growing = False\n    return growing\n\n\n# Display the sales table\nprint(LAYOUT.format(\"Region\", tbl_month[0], tbl_month[1],\n                    tbl_month[2], \"Quarter\", \"\"))\nprint(\"-\" * 44)\n\nmonth_totals = [0] * len(tbl_month)\nbest = 0\n\nfor index in range(len(tbl_region)):\n    row = tbl_sales[index]\n\n    flag = \"\"\n    if is_growing(row):\n        flag = \"GROWING\"\n\n    print(LAYOUT.format(tbl_region[index], row[0], row[1],\n                        row[2], row_total(row), flag))\n\n    # Add this region's sales to the total for each month\n    for month in range(len(row)):\n        month_totals[month] = month_totals[month] + row[month]\n\n    if row_total(row) > row_total(tbl_sales[best]):\n        best = index\n\nprint(\"-\" * 44)\nprint(LAYOUT.format(\"All\", month_totals[0], month_totals[1],\n                    month_totals[2], row_total(month_totals), \"\"))\n\n# Change from the first month to the last\nchange = (month_totals[-1] - month_totals[0]) / month_totals[0] * 100\n\nprint()\nprint(\"Best region:\", tbl_region[best])\nprint(\"Change over the quarter: {:.1f}%\".format(change))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable or array for tracking the totals for each month (guidance: Initial values could be zero or the first region's figures)",
    "description": "Any variable or array for tracking the totals for each month"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A loop or expression that totals one row of the array",
    "description": "A loop or expression that totals one row of the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row of month names and a dividing line displayed (guidance: Month names must come from the array, not be typed again)",
    "description": "Header row of month names and a dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the array displayed (guidance: Disregard presence/lack of the quarter total)",
    "description": "Rows of the array displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Each figure is compared with the one before it (guidance: Any relational operator)",
    "description": "Each figure is compared with the one before it"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "GROWING displayed for every growing region, and no others (guidance: A single fall must prevent the flag)",
    "description": "GROWING displayed for every growing region, and no others"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Totals accumulated for each month separately (guidance: The index must identify the month, not the region)",
    "description": "Totals accumulated for each month separately"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Best region in the quarter identified correctly (guidance: By any method except hard-coded)",
    "description": "Best region in the quarter identified correctly"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Percentage change calculated from the first and last month totals (guidance: (last - first) / first * 100)",
    "description": "Percentage change calculated from the first and last month totals"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable or array for tracking the totals for each month (guidance: Initial values could be zero or the first region's figures)\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A loop or expression that totals one row of the array\nA4: Header row of month names and a dividing line displayed (guidance: Month names must come from the array, not be typed again)\nA5: Rows of the array displayed (guidance: Disregard presence/lack of the quarter total)\nA6: Each figure is compared with the one before it (guidance: Any relational operator)\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: GROWING displayed for every growing region, and no others (guidance: A single fall must prevent the flag)\nA9: Totals accumulated for each month separately (guidance: The index must identify the month, not the region)\nA10: Best region in the quarter identified correctly (guidance: By any method except hard-coded)\nA11: Percentage change calculated from the first and last month totals (guidance: (last - first) / first * 100)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q21",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q21 Quiz scores from a file",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A quiz club stores the scores from its last meeting in a text file.\nEach line of the file holds one player's name and their score, separated by a comma.\nThe club wants a program that reads the file and reports on the scores.\n\nThe code file contains these data structures:\n• tbl_name stores the player names read from the file.\n• tbl_score stores the scores read from the file.\n\nFigure 1 shows the contents of scores.txt.\n```\nNadia,38\nOskar,24\nPearl,45\nQuinn,31\nRafael,45\nSylvie,19\n```\n(Figure 1)\n\nThe program must:\n• read scores.txt and store the names and scores in the two arrays\n• display a table with:\n    – a header row and a dividing line\n    – each player, their score and how far they are above or below the average\n• display the number of players, the average score to 1 decimal place and the highest score\n• display the name of every player who scored the highest score\n• write the summary lines to a file called summary.txt\n\nFigure 2 shows the output from a working program.\n```\nPlayer      Score    Difference\n-------------------------------\nNadia          38          +4.3\nOskar          24          -9.7\nPearl          45         +11.3\nQuinn          31          -2.7\nRafael         45         +11.3\nSylvie         19         -14.7\n-------------------------------\nPlayers: 6\nAverage score: 33.7\nHighest score: 45\nTop scorer: Pearl\nTop scorer: Rafael\n```\n(Figure 2)\n\nFigure 3 shows the summary.txt file produced by a working program.\n```\nPlayers: 6\nAverage score: 33.7\nHighest score: 45\nTop scorer: Pearl\nTop scorer: Rafael\n```\n(Figure 3)\n\nOpen Q21 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q21FINISHED with the correct file extension for the programming language.",
  "starter": "# Q21\n\ntbl_name = []\ntbl_score = []\n\nFILE_IN = \"scores.txt\"\nFILE_OUT = \"summary.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q21.py",
  "solution": "# Q21\n\ntbl_name = []\ntbl_score = []\n\nFILE_IN = \"scores.txt\"\nFILE_OUT = \"summary.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<10}{:>7}{:>14}\"\n\n\n# Reads the file and fills the two arrays\ndef load_scores(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            parts = line.split(\",\")\n            tbl_name.append(parts[0])\n            tbl_score.append(int(parts[1]))\n    file.close()\n\n\nload_scores(FILE_IN)\n\n# Work out the average and the highest score\ntotal = 0\nhighest = tbl_score[0]\n\nfor index in range(len(tbl_score)):\n    total = total + tbl_score[index]\n    if tbl_score[index] > highest:\n        highest = tbl_score[index]\n\naverage = total / len(tbl_score)\n\n# Display the table\nprint(LAYOUT.format(\"Player\", \"Score\", \"Difference\"))\nprint(\"-\" * 31)\n\nfor index in range(len(tbl_name)):\n    difference = tbl_score[index] - average\n    print(LAYOUT.format(tbl_name[index], tbl_score[index],\n                        \"{:+.1f}\".format(difference)))\n\nprint(\"-\" * 31)\n\n# Build the summary and show it on the screen\nsummary = []\nsummary.append(\"Players: \" + str(len(tbl_name)))\nsummary.append(\"Average score: {:.1f}\".format(average))\nsummary.append(\"Highest score: \" + str(highest))\n\nfor index in range(len(tbl_name)):\n    if tbl_score[index] == highest:\n        summary.append(\"Top scorer: \" + tbl_name[index])\n\nfor line in summary:\n    print(line)\n\n# Write the summary to its own file\nout = open(FILE_OUT, \"w\")\nfor line in summary:\n    out.write(line + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file (guidance: Accept for line in file, readline() or readlines())",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split on the comma (guidance: Accept any method that separates the two fields)",
    "description": "Each line is split on the comma"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The name is appended to its array",
    "description": "The name is appended to its array"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The score is converted to an integer before being appended (guidance: No mark if the score is stored as a string)",
    "description": "The score is converted to an integer before being appended"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Relational operator used to find the highest score (guidance: > or >= either acceptable)",
    "description": "Relational operator used to find the highest score"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The difference from the average is calculated for each player",
    "description": "The difference from the average is calculated for each player"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Every player on the highest score is named, not only the first (guidance: A second loop or a list of names)",
    "description": "Every player on the highest score is named, not only the first"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The output file is opened for writing, written to and closed (guidance: All three needed for the mark)",
    "description": "The output file is opened for writing, written to and closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file (guidance: Accept for line in file, readline() or readlines())\nA3: Each line is split on the comma (guidance: Accept any method that separates the two fields)\nA4: The name is appended to its array\nA5: The score is converted to an integer before being appended (guidance: No mark if the score is stored as a string)\nA6: The input file is closed\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Relational operator used to find the highest score (guidance: > or >= either acceptable)\nA9: The difference from the average is calculated for each player\nA10: Every player on the highest score is named, not only the first (guidance: A second loop or a list of names)\nA11: The output file is opened for writing, written to and closed (guidance: All three needed for the mark)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "scores.txt": "Nadia,38\nOskar,24\nPearl,45\nQuinn,31\nRafael,45\nSylvie,19\n"
  }
 },
 {
  "id": "tmb_q22",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q22 Club membership list",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A chess club keeps its membership list in a text file.\nEach line holds a member's name, their age and their rating, separated by commas.\nThe club wants a program that adds a new member and reports on the membership.\n\nThe code file contains these data structures:\n• tbl_member stores one row for each member read from the file: name, age, rating.\n\nFigure 1 shows the contents of members.txt.\n```\nArlo,14,1120\nBirgit,16,1455\nCosmo,13,980\nDelia,17,1610\n```\n(Figure 1)\n\nThe program must:\n• read members.txt into the array\n• allow an organiser to input a new member's name, age and rating\n    – the age must be from 8 to 18; if it is not, an appropriate error message is given and the member is not added\n    – otherwise the new member is appended to the file and to the array\n• display a table with:\n    – a header row and a dividing line\n    – each member, their age and their rating\n• display how many members there are and the average rating as a whole number\n• display the name of the highest rated member\n\nFigure 2 shows the output from a working program.\n```\nNew member name: Esen\nAge: 15\nRating: 1285\nEsen added\n\nMember       Age   Rating\n-------------------------\nArlo          14     1120\nBirgit        16     1455\nCosmo         13      980\nDelia         17     1610\nEsen          15     1285\n-------------------------\nMembers: 5\nAverage rating: 1290\nHighest rated: Delia\n```\n(Figure 2)\n\nFigure 3 shows the members.txt file produced by a working program.\n```\nArlo,14,1120\nBirgit,16,1455\nCosmo,13,980\nDelia,17,1610\nEsen,15,1285\n```\n(Figure 3)\n\nOpen Q22 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q22FINISHED with the correct file extension for the programming language.",
  "starter": "# Q22\n\ntbl_member = []\n\nFILE_NAME = \"members.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q22.py",
  "solution": "# Q22\n\ntbl_member = []\n\nFILE_NAME = \"members.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nMIN_AGE = 8\nMAX_AGE = 18\nLAYOUT = \"{:<10}{:>6}{:>9}\"\n\n\n# Reads the membership file into the array\ndef load_members(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            parts = line.split(\",\")\n            tbl_member.append([parts[0], int(parts[1]), int(parts[2])])\n    file.close()\n\n\nload_members(FILE_NAME)\n\n# Add a new member\nname = input(\"New member name: \")\nage = int(input(\"Age: \"))\nrating = int(input(\"Rating: \"))\n\nif age < MIN_AGE or age > MAX_AGE:\n    print(\"Age must be from\", MIN_AGE, \"to\", MAX_AGE)\nelse:\n    file = open(FILE_NAME, \"a\")\n    file.write(name + \",\" + str(age) + \",\" + str(rating) + \"\\n\")\n    file.close()\n    tbl_member.append([name, age, rating])\n    print(name, \"added\")\n\n# Display the membership table\nprint()\nprint(LAYOUT.format(\"Member\", \"Age\", \"Rating\"))\nprint(\"-\" * 25)\n\ntotal = 0\nbest = 0\n\nfor index in range(len(tbl_member)):\n    row = tbl_member[index]\n    print(LAYOUT.format(row[0], row[1], row[2]))\n\n    total = total + row[2]\n\n    if row[2] > tbl_member[best][2]:\n        best = index\n\nprint(\"-\" * 25)\nprint(\"Members:\", len(tbl_member))\nprint(\"Average rating:\", round(total / len(tbl_member)))\nprint(\"Highest rated:\", tbl_member[best][0])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The file is opened for reading (guidance: Any valid open for reading)",
    "description": "The file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The age and rating are converted to integers before being stored (guidance: No mark if they are stored as strings)",
    "description": "The age and rating are converted to integers before being stored"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The file is closed after reading",
    "description": "The file is closed after reading"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to test the age against both limits (guidance: Both ends of the range must be tested)",
    "description": "Relational operators used to test the age against both limits"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed for an age outside the range, and no member added",
    "description": "Error message displayed for an age outside the range, and no member added"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The file is opened in append mode and the new record written (guidance: No mark for \"w\", which would destroy the existing members)",
    "description": "The file is opened in append mode and the new record written"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Average rating calculated correctly by any method (guidance: Must include the new member when one was added)",
    "description": "Average rating calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Highest rated member identified correctly (guidance: By any method except hard-coded)",
    "description": "Highest rated member identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split into its three fields\nA4: The age and rating are converted to integers before being stored (guidance: No mark if they are stored as strings)\nA5: The file is closed after reading\nA6: Relational operators used to test the age against both limits (guidance: Both ends of the range must be tested)\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed for an age outside the range, and no member added\nA9: The file is opened in append mode and the new record written (guidance: No mark for \"w\", which would destroy the existing members)\nA10: Average rating calculated correctly by any method (guidance: Must include the new member when one was added)\nA11: Highest rated member identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "File handling",
  "dataFiles": {
   "members.txt": "Arlo,14,1120\nBirgit,16,1455\nCosmo,13,980\nDelia,17,1610\n"
  }
 },
 {
  "id": "tmb_q23",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q23 Warehouse reorder report",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A warehouse stores its stock records in a text file.\nEach line holds an item code, the quantity in stock and the reorder level, separated by commas.\nAn item must be reordered when its quantity is at or below its reorder level.\n\nThe code file contains these data structures:\n• tbl_code stores the item codes read from the file.\n• tbl_quantity stores the quantities read from the file.\n• tbl_reorder stores the reorder levels read from the file.\n\nFigure 1 shows the contents of stock.txt.\n```\nBLT-100,45,20\nNUT-220,12,25\nSCR-045,8,10\nWSH-310,96,30\nBRK-002,15,15\nPIN-777,140,50\n```\n(Figure 1)\n\nThe program must:\n• read stock.txt and store the three fields in the three arrays\n• display a table with:\n    – a header row and a dividing line\n    – each item code, its quantity, its reorder level and either OK or REORDER\n• display how many items need reordering\n• write the item codes that need reordering to a file called reorder.txt, one on each line\n• display a message confirming that the reorder file has been created\n\nFigure 2 shows the output from a working program.\n```\nCode        Quantity   Reorder    Status\n----------------------------------------\nBLT-100           45        20        OK\nNUT-220           12        25   REORDER\nSCR-045            8        10   REORDER\nWSH-310           96        30        OK\nBRK-002           15        15   REORDER\nPIN-777          140        50        OK\n----------------------------------------\nItems to reorder: 3\nReorder file has been created\n```\n(Figure 2)\n\nFigure 3 shows the reorder.txt file produced by a working program.\n```\nNUT-220\nSCR-045\nBRK-002\n```\n(Figure 3)\n\nOpen Q23 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q23FINISHED with the correct file extension for the programming language.",
  "starter": "# Q23\n\ntbl_code = []\ntbl_quantity = []\ntbl_reorder = []\n\nFILE_IN = \"stock.txt\"\nFILE_OUT = \"reorder.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q23.py",
  "solution": "# Q23\n\ntbl_code = []\ntbl_quantity = []\ntbl_reorder = []\n\nFILE_IN = \"stock.txt\"\nFILE_OUT = \"reorder.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<10}{:>10}{:>10}{:>10}\"\n\n\n# Reads the stock file into the three arrays\ndef load_stock(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            parts = line.split(\",\")\n            tbl_code.append(parts[0])\n            tbl_quantity.append(int(parts[1]))\n            tbl_reorder.append(int(parts[2]))\n    file.close()\n\n\n# Returns True when an item has reached its reorder level\ndef needs_reorder(quantity, level):\n    return quantity <= level\n\n\nload_stock(FILE_IN)\n\n# Display the stock table\nprint(LAYOUT.format(\"Code\", \"Quantity\", \"Reorder\", \"Status\"))\nprint(\"-\" * 40)\n\nwanted = []\n\nfor index in range(len(tbl_code)):\n    if needs_reorder(tbl_quantity[index], tbl_reorder[index]):\n        status = \"REORDER\"\n        wanted.append(tbl_code[index])\n    else:\n        status = \"OK\"\n\n    print(LAYOUT.format(tbl_code[index], tbl_quantity[index],\n                        tbl_reorder[index], status))\n\nprint(\"-\" * 40)\nprint(\"Items to reorder:\", len(wanted))\n\n# Write the reorder list to its own file\nout = open(FILE_OUT, \"w\")\nfor code in wanted:\n    out.write(code + \"\\n\")\nout.close()\n\nprint(\"Reorder file has been created\")\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The quantity and reorder level are converted to integers (guidance: No mark if they are compared as strings)",
    "description": "The quantity and reorder level are converted to integers"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator compares the quantity with the reorder level (guidance: <= needed; < alone does not meet the requirement)",
    "description": "Relational operator compares the quantity with the reorder level"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "REORDER shown for every item at or below its level, and no others",
    "description": "REORDER shown for every item at or below its level, and no others"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The codes to reorder are collected (guidance: Accept an array or writing straight to the file)",
    "description": "The codes to reorder are collected"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The number of items to reorder is counted correctly",
    "description": "The number of items to reorder is counted correctly"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The output file is opened for writing, written to and closed (guidance: One code on each line)",
    "description": "The output file is opened for writing, written to and closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split into its three fields\nA4: The quantity and reorder level are converted to integers (guidance: No mark if they are compared as strings)\nA5: The input file is closed\nA6: Relational operator compares the quantity with the reorder level (guidance: <= needed; < alone does not meet the requirement)\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: REORDER shown for every item at or below its level, and no others\nA9: The codes to reorder are collected (guidance: Accept an array or writing straight to the file)\nA10: The number of items to reorder is counted correctly\nA11: The output file is opened for writing, written to and closed (guidance: One code on each line)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "stock.txt": "BLT-100,45,20\nNUT-220,12,25\nSCR-045,8,10\nWSH-310,96,30\nBRK-002,15,15\nPIN-777,140,50\n"
  }
 },
 {
  "id": "tmb_q24",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q24 Temperature log",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A greenhouse records its temperature every hour.\nThe readings are stored in a text file, one reading on each line, in degrees Celsius.\nThe safe range for the greenhouse is 12 to 28 degrees.\n\nThe code file contains these data structures:\n• tbl_reading stores the readings read from the file.\n\nFigure 1 shows the contents of templog.txt.\n```\n14.5\n13.0\n11.2\n16.8\n21.4\n26.9\n30.1\n29.5\n24.0\n19.6\n15.3\n10.8\n```\n(Figure 1)\n\nThe program must:\n• read templog.txt into the array\n• display a table with:\n    – a header row and a dividing line\n    – the hour number, the reading and either SAFE, LOW or HIGH\n• display the lowest reading, the highest reading and the average to 1 decimal place\n• display how many readings were outside the safe range\n• write a report of the unsafe readings to a file called alerts.txt\nThe first reading in the file is hour 1.\n\nFigure 2 shows the output from a working program.\n```\n  Hour   Reading  Status\n------------------------\n     1      14.5    SAFE\n     2      13.0    SAFE\n     3      11.2     LOW\n     4      16.8    SAFE\n     5      21.4    SAFE\n     6      26.9    SAFE\n     7      30.1    HIGH\n     8      29.5    HIGH\n     9      24.0    SAFE\n    10      19.6    SAFE\n    11      15.3    SAFE\n    12      10.8     LOW\n------------------------\nLowest: 10.8\nHighest: 30.1\nAverage: 19.4\nOutside the safe range: 4\n```\n(Figure 2)\n\nFigure 3 shows the alerts.txt file produced by a working program.\n```\nUnsafe readings: 4\nHour 3: 11.2 is LOW\nHour 7: 30.1 is HIGH\nHour 8: 29.5 is HIGH\nHour 12: 10.8 is LOW\n```\n(Figure 3)\n\nOpen Q24 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q24FINISHED with the correct file extension for the programming language.",
  "starter": "# Q24\n\ntbl_reading = []\n\nFILE_IN = \"templog.txt\"\nFILE_OUT = \"alerts.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q24.py",
  "solution": "# Q24\n\ntbl_reading = []\n\nFILE_IN = \"templog.txt\"\nFILE_OUT = \"alerts.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nSAFE_LOW = 12\nSAFE_HIGH = 28\nLAYOUT = \"{:>6}{:>10}{:>8}\"\n\n\n# Reads the log file into the array\ndef load_log(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            tbl_reading.append(float(line))\n    file.close()\n\n\n# Returns SAFE, LOW or HIGH for one reading\ndef status_of(reading):\n    if reading < SAFE_LOW:\n        return \"LOW\"\n    elif reading > SAFE_HIGH:\n        return \"HIGH\"\n    else:\n        return \"SAFE\"\n\n\nload_log(FILE_IN)\n\n# Display the log table\nprint(LAYOUT.format(\"Hour\", \"Reading\", \"Status\"))\nprint(\"-\" * 24)\n\nlowest = tbl_reading[0]\nhighest = tbl_reading[0]\ntotal = 0.0\nunsafe = 0\nalerts = []\n\nfor index in range(len(tbl_reading)):\n    reading = tbl_reading[index]\n    status = status_of(reading)\n\n    print(LAYOUT.format(index + 1, reading, status))\n\n    total = total + reading\n    if reading < lowest:\n        lowest = reading\n    if reading > highest:\n        highest = reading\n\n    if status != \"SAFE\":\n        unsafe = unsafe + 1\n        alerts.append(\"Hour \" + str(index + 1) + \": \" + str(reading)\n                      + \" is \" + status)\n\nprint(\"-\" * 24)\nprint(\"Lowest:\", lowest)\nprint(\"Highest:\", highest)\nprint(\"Average: {:.1f}\".format(total / len(tbl_reading)))\nprint(\"Outside the safe range:\", unsafe)\n\n# Write the alert report\nout = open(FILE_OUT, \"w\")\nout.write(\"Unsafe readings: \" + str(unsafe) + \"\\n\")\nfor line in alerts:\n    out.write(line + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each reading is converted to a real number before being stored (guidance: float() or equivalent; no mark if stored as a string)",
    "description": "Each reading is converted to a real number before being stored"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Relational operators used to test a reading against both limits (guidance: Both ends of the range must be tested)",
    "description": "Relational operators used to test a reading against both limits"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Lowest and highest are initialised from the data, not hard-coded (guidance: Accept the first reading or a value from the first comparison)",
    "description": "Lowest and highest are initialised from the data, not hard-coded"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The hour number is displayed beside each reading (guidance: Must start at 1, so the index is adjusted)",
    "description": "The hour number is displayed beside each reading"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Lowest and highest updated correctly as the readings are processed",
    "description": "Lowest and highest updated correctly as the readings are processed"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Readings outside the safe range counted correctly",
    "description": "Readings outside the safe range counted correctly"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The output file is opened for writing, written to and closed",
    "description": "The output file is opened for writing, written to and closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each reading is converted to a real number before being stored (guidance: float() or equivalent; no mark if stored as a string)\nA4: The input file is closed\nA5: Relational operators used to test a reading against both limits (guidance: Both ends of the range must be tested)\nA6: Lowest and highest are initialised from the data, not hard-coded (guidance: Accept the first reading or a value from the first comparison)\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: The hour number is displayed beside each reading (guidance: Must start at 1, so the index is adjusted)\nA9: Lowest and highest updated correctly as the readings are processed\nA10: Readings outside the safe range counted correctly\nA11: The output file is opened for writing, written to and closed\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "File handling",
  "dataFiles": {
   "templog.txt": "14.5\n13.0\n11.2\n16.8\n21.4\n26.9\n30.1\n29.5\n24.0\n19.6\n15.3\n10.8\n"
  }
 },
 {
  "id": "tmb_q25",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q25 Attendance letters",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A school stores attendance records in a text file.\nEach line holds a student's name, the sessions they attended and the sessions available, separated by commas.\nA letter is sent home when attendance falls below 90%.\n\nThe code file contains these data structures:\n• tbl_student stores the student names read from the file.\n• tbl_attended stores the sessions attended.\n• tbl_possible stores the sessions available.\n\nFigure 1 shows the contents of attendance.txt.\n```\nHana,182,190\nIvan,151,190\nJoy,190,190\nKwame,168,190\nLina,174,190\nMarco,139,190\n```\n(Figure 1)\n\nThe program must:\n• read attendance.txt and store the three fields in the three arrays\n• calculate each student's attendance as a percentage using a subprogram\n• display a table with:\n    – a header row and a dividing line\n    – each student, their sessions attended, their percentage to 1 decimal place and LETTER beside anyone below 90%\n• display the attendance for the whole group as a percentage to 1 decimal place\n• display the name of the student with the best attendance\n• write one line for each student needing a letter to a file called letters.txt\n\nFigure 2 shows the output from a working program.\n```\nStudent    Attended       %  \n--------------------------------\nHana            182    95.8  \nIvan            151    79.5  LETTER\nJoy             190   100.0  \nKwame           168    88.4  LETTER\nLina            174    91.6  \nMarco           139    73.2  LETTER\n--------------------------------\nGroup attendance: 88.1%\nBest attendance: Joy\nLetters file written: 3 letters\n```\n(Figure 2)\n\nFigure 3 shows the letters.txt file produced by a working program.\n```\nIvan attended 79.5% of sessions\nKwame attended 88.4% of sessions\nMarco attended 73.2% of sessions\n```\n(Figure 3)\n\nOpen Q25 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q25FINISHED with the correct file extension for the programming language.",
  "starter": "# Q25\n\ntbl_student = []\ntbl_attended = []\ntbl_possible = []\n\nFILE_IN = \"attendance.txt\"\nFILE_OUT = \"letters.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q25.py",
  "solution": "# Q25\n\ntbl_student = []\ntbl_attended = []\ntbl_possible = []\n\nFILE_IN = \"attendance.txt\"\nFILE_OUT = \"letters.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nTARGET = 90\nLAYOUT = \"{:<9}{:>10}{:>8}  {}\"\n\n\n# Reads the attendance file into the three arrays\ndef load_attendance(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            parts = line.split(\",\")\n            tbl_student.append(parts[0])\n            tbl_attended.append(int(parts[1]))\n            tbl_possible.append(int(parts[2]))\n    file.close()\n\n\n# Returns an attendance percentage\ndef percentage(attended, possible):\n    if possible == 0:\n        return 0.0\n    return attended / possible * 100\n\n\nload_attendance(FILE_IN)\n\n# Display the attendance table\nprint(LAYOUT.format(\"Student\", \"Attended\", \"%\", \"\"))\nprint(\"-\" * 32)\n\ntotal_attended = 0\ntotal_possible = 0\nbest = 0\nletters = []\n\nfor index in range(len(tbl_student)):\n    rate = percentage(tbl_attended[index], tbl_possible[index])\n\n    flag = \"\"\n    if rate < TARGET:\n        flag = \"LETTER\"\n        letters.append(tbl_student[index] + \" attended \"\n                       + \"{:.1f}\".format(rate) + \"% of sessions\")\n\n    print(LAYOUT.format(tbl_student[index], tbl_attended[index],\n                        \"{:.1f}\".format(rate), flag))\n\n    total_attended = total_attended + tbl_attended[index]\n    total_possible = total_possible + tbl_possible[index]\n\n    if rate > percentage(tbl_attended[best], tbl_possible[best]):\n        best = index\n\nprint(\"-\" * 32)\nprint(\"Group attendance: {:.1f}%\".format(\n    percentage(total_attended, total_possible)))\nprint(\"Best attendance:\", tbl_student[best])\n\n# Write the letters file\nout = open(FILE_OUT, \"w\")\nfor line in letters:\n    out.write(line + \"\\n\")\nout.close()\n\nprint(\"Letters file written:\", len(letters), \"letters\")\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The session counts are converted to integers",
    "description": "The session counts are converted to integers"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Percentage calculated as attended / possible * 100",
    "description": "Percentage calculated as attended / possible * 100"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Relational operator used to compare attendance with the target (guidance: < 90 or <= 89.9 and equivalents)",
    "description": "Relational operator used to compare attendance with the target"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "A line is built for each student needing a letter",
    "description": "A line is built for each student needing a letter"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Group attendance calculated from the totals, not by averaging the percentages (guidance: Total attended / total possible)",
    "description": "Group attendance calculated from the totals, not by averaging the percentages"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The output file is opened for writing, written to and closed",
    "description": "The output file is opened for writing, written to and closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split into its three fields\nA4: The session counts are converted to integers\nA5: The input file is closed\nA6: Percentage calculated as attended / possible * 100\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: Relational operator used to compare attendance with the target (guidance: < 90 or <= 89.9 and equivalents)\nA9: A line is built for each student needing a letter\nA10: Group attendance calculated from the totals, not by averaging the percentages (guidance: Total attended / total possible)\nA11: The output file is opened for writing, written to and closed\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "attendance.txt": "Hana,182,190\nIvan,151,190\nJoy,190,190\nKwame,168,190\nLina,174,190\nMarco,139,190\n"
  }
 },
 {
  "id": "tmb_q26",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q26 Race results file",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A running club stores the finishing times from a race in a text file.\nEach line holds a runner's number, their name and their time in seconds, separated by commas.\nThe club wants the results written out as a tidy table in a new file.\n\nThe code file contains these data structures:\n• tbl_number stores the runner numbers read from the file.\n• tbl_runner stores the runner names read from the file.\n• tbl_seconds stores the times in seconds read from the file.\n\nFigure 1 shows the contents of race.txt.\n```\n14,Ines,1284\n7,Jarrah,1156\n22,Kofi,1402\n3,Lotte,1098\n19,Milan,1331\n31,Nuru,1205\n```\n(Figure 1)\n\nThe program must:\n• read race.txt and store the three fields in the three arrays\n• use a subprogram to turn a time in seconds into minutes and seconds in the form 19:24\n• display a table with:\n    – a header row and a dividing line\n    – each runner's number, name, time and how far behind the winner they finished\n• display the name and time of the winner\n• display the average time in minutes and seconds\n• write the same table to a file called results.txt\n\nFigure 2 shows the output from a working program.\n```\n No.  Runner       Time   Behind\n------------------------------\n  14  Ines        21:24     3:06\n   7  Jarrah      19:16     0:58\n  22  Kofi        23:22     5:04\n   3  Lotte       18:18     0:00\n  19  Milan       22:11     3:53\n  31  Nuru        20:05     1:47\n------------------------------\nWinner: Lotte in 18:18\nAverage time: 20:46\n```\n(Figure 2)\n\nFigure 3 shows the results.txt file produced by a working program.\n```\n No.  Runner       Time   Behind\n------------------------------\n  14  Ines        21:24     3:06\n   7  Jarrah      19:16     0:58\n  22  Kofi        23:22     5:04\n   3  Lotte       18:18     0:00\n  19  Milan       22:11     3:53\n  31  Nuru        20:05     1:47\n------------------------------\nWinner: Lotte in 18:18\nAverage time: 20:46\n```\n(Figure 3)\n\nOpen Q26 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q26FINISHED with the correct file extension for the programming language.",
  "starter": "# Q26\n\ntbl_number = []\ntbl_runner = []\ntbl_seconds = []\n\nFILE_IN = \"race.txt\"\nFILE_OUT = \"results.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q26.py",
  "solution": "# Q26\n\ntbl_number = []\ntbl_runner = []\ntbl_seconds = []\n\nFILE_IN = \"race.txt\"\nFILE_OUT = \"results.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:>4}  {:<9}{:>8}{:>9}\"\n\n\n# Reads the race file into the three arrays\ndef load_race(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            parts = line.split(\",\")\n            tbl_number.append(int(parts[0]))\n            tbl_runner.append(parts[1])\n            tbl_seconds.append(int(parts[2]))\n    file.close()\n\n\n# Returns a number of seconds in the form minutes:seconds\ndef as_time(seconds):\n    return str(seconds // 60) + \":\" + str(seconds % 60).zfill(2)\n\n\nload_race(FILE_IN)\n\n# Find the winning time\nwinner = 0\ntotal = 0\n\nfor index in range(len(tbl_seconds)):\n    total = total + tbl_seconds[index]\n    if tbl_seconds[index] < tbl_seconds[winner]:\n        winner = index\n\n# Build the table, one line at a time\nreport = []\nreport.append(LAYOUT.format(\"No.\", \"Runner\", \"Time\", \"Behind\"))\nreport.append(\"-\" * 30)\n\nfor index in range(len(tbl_runner)):\n    behind = tbl_seconds[index] - tbl_seconds[winner]\n    report.append(LAYOUT.format(tbl_number[index], tbl_runner[index],\n                                as_time(tbl_seconds[index]), as_time(behind)))\n\nreport.append(\"-\" * 30)\nreport.append(\"Winner: \" + tbl_runner[winner] + \" in \"\n              + as_time(tbl_seconds[winner]))\nreport.append(\"Average time: \" + as_time(round(total / len(tbl_seconds))))\n\n# Show it on screen and write the same lines to the file\nfor line in report:\n    print(line)\n\nout = open(FILE_OUT, \"w\")\nfor line in report:\n    out.write(line + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The time is converted to an integer before being stored",
    "description": "The time is converted to an integer before being stored"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Minutes and seconds calculated with integer division and modulus (guidance: DIV and MOD, or // and %)",
    "description": "Minutes and seconds calculated with integer division and modulus"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Relational operator used to find the winning time (guidance: < or <= either acceptable)",
    "description": "Relational operator used to find the winning time"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The gap behind the winner is calculated for each runner",
    "description": "The gap behind the winner is calculated for each runner"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Average time calculated correctly and shown in minutes and seconds",
    "description": "Average time calculated correctly and shown in minutes and seconds"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The same table is written to the output file, which is closed (guidance: Accept rebuilding the lines a second time)",
    "description": "The same table is written to the output file, which is closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split into its three fields\nA4: The time is converted to an integer before being stored\nA5: The input file is closed\nA6: Minutes and seconds calculated with integer division and modulus (guidance: DIV and MOD, or // and %)\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: Relational operator used to find the winning time (guidance: < or <= either acceptable)\nA9: The gap behind the winner is calculated for each runner\nA10: Average time calculated correctly and shown in minutes and seconds\nA11: The same table is written to the output file, which is closed (guidance: Accept rebuilding the lines a second time)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "race.txt": "14,Ines,1284\n7,Jarrah,1156\n22,Kofi,1402\n3,Lotte,1098\n19,Milan,1331\n31,Nuru,1205\n"
  }
 },
 {
  "id": "tmb_q27",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q27 Word statistics",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A teacher wants statistics about a piece of writing stored in a text file.\nThe file holds one sentence on each line.\n\nThe code file contains these data structures:\n• tbl_line stores the lines read from the file.\n\nFigure 1 shows the contents of writing.txt.\n```\nThe storm arrived before dawn\nWaves crashed against the harbour wall\nNobody slept\nBy morning the boats were safe again\n```\n(Figure 1)\n\nThe program must:\n• read writing.txt into the array\n• display a table with:\n    – a header row and a dividing line\n    – the line number, the number of words on that line and the number of characters\n• display the total number of lines, words and characters\n• display the average number of words per line to 1 decimal place\n• display the longest word found anywhere in the file\n• write the statistics to a file called stats.txt\nCount the characters in a line without counting the end of the line itself.\n\nFigure 2 shows the output from a working program.\n```\n  Line   Words  Characters\n--------------------------\n     1       5          29\n     2       6          38\n     3       2          12\n     4       7          36\n--------------------------\nLines: 4\nWords: 20\nCharacters: 115\nAverage words per line: 5.0\nLongest word: arrived\n```\n(Figure 2)\n\nFigure 3 shows the stats.txt file produced by a working program.\n```\nLines: 4\nWords: 20\nCharacters: 115\nAverage words per line: 5.0\nLongest word: arrived\n```\n(Figure 3)\n\nOpen Q27 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q27FINISHED with the correct file extension for the programming language.",
  "starter": "# Q27\n\ntbl_line = []\n\nFILE_IN = \"writing.txt\"\nFILE_OUT = \"stats.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q27.py",
  "solution": "# Q27\n\ntbl_line = []\n\nFILE_IN = \"writing.txt\"\nFILE_OUT = \"stats.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:>6}{:>8}{:>12}\"\n\n\n# Reads the writing file into the array\ndef load_lines(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            tbl_line.append(line)\n    file.close()\n\n\n# Returns the longest word in a line\ndef longest_in(line):\n    best = \"\"\n    for word in line.split(\" \"):\n        if len(word) > len(best):\n            best = word\n    return best\n\n\nload_lines(FILE_IN)\n\n# Display the statistics table\nprint(LAYOUT.format(\"Line\", \"Words\", \"Characters\"))\nprint(\"-\" * 26)\n\ntotal_words = 0\ntotal_characters = 0\nlongest = \"\"\n\nfor index in range(len(tbl_line)):\n    line = tbl_line[index]\n    words = len(line.split(\" \"))\n    characters = len(line)\n\n    print(LAYOUT.format(index + 1, words, characters))\n\n    total_words = total_words + words\n    total_characters = total_characters + characters\n\n    if len(longest_in(line)) > len(longest):\n        longest = longest_in(line)\n\nprint(\"-\" * 26)\n\nstats = []\nstats.append(\"Lines: \" + str(len(tbl_line)))\nstats.append(\"Words: \" + str(total_words))\nstats.append(\"Characters: \" + str(total_characters))\nstats.append(\"Average words per line: {:.1f}\".format(\n    total_words / len(tbl_line)))\nstats.append(\"Longest word: \" + longest)\n\nfor line in stats:\n    print(line)\n\n# Write the statistics to their own file\nout = open(FILE_OUT, \"w\")\nfor line in stats:\n    out.write(line + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Lines are stored in the array",
    "description": "Lines are stored in the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A line is split into words (guidance: Accept split() with or without a separator)",
    "description": "A line is split into words"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare word lengths",
    "description": "Relational operator used to compare word lengths"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Words on a line counted correctly",
    "description": "Words on a line counted correctly"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Characters on a line counted without the end of line character (guidance: strip() used, or 1 subtracted)",
    "description": "Characters on a line counted without the end of line character"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The longest word in the whole file is found, not just in one line",
    "description": "The longest word in the whole file is found, not just in one line"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The output file is opened for writing, written to and closed",
    "description": "The output file is opened for writing, written to and closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Lines are stored in the array\nA4: The input file is closed\nA5: A line is split into words (guidance: Accept split() with or without a separator)\nA6: Relational operator used to compare word lengths\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: Words on a line counted correctly\nA9: Characters on a line counted without the end of line character (guidance: strip() used, or 1 subtracted)\nA10: The longest word in the whole file is found, not just in one line\nA11: The output file is opened for writing, written to and closed\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "File handling",
  "dataFiles": {
   "writing.txt": "The storm arrived before dawn\nWaves crashed against the harbour wall\nNobody slept\nBy morning the boats were safe again\n"
  }
 },
 {
  "id": "tmb_q28",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q28 Fuel costs for a fleet",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A delivery company stores a record of each van's journeys in a text file.\nEach line holds a van's registration, the miles driven and the litres of fuel used, separated by commas.\nFuel costs £1.48 per litre.\n\nThe code file contains these data structures:\n• tbl_van stores the registrations read from the file.\n• tbl_miles stores the miles driven.\n• tbl_litres stores the litres of fuel used.\n\nFigure 1 shows the contents of fleet.txt.\n```\nBD21 OPQ,842,96.5\nCE19 RST,1130,142.0\nDF70 UVW,615,58.2\nGH22 XYZ,978,131.4\nJK68 ABC,1402,149.8\n```\n(Figure 1)\n\nThe program must:\n• read fleet.txt and store the three fields in the three arrays\n• use a subprogram to calculate the miles per litre for a van\n• display a table with:\n    – a header row and a dividing line\n    – each van, its miles, its litres, its miles per litre to 1 decimal place and its fuel cost\n• display the fleet total for miles, litres and cost\n• display the registration of the most efficient van and of the least efficient van\n• write the registrations of any van below 8 miles per litre to a file called service.txt\n\nFigure 2 shows the output from a working program.\n```\nVan          Miles   Litres     MPL      Cost\n---------------------------------------------\nBD21 OPQ       842     96.5     8.7   £142.82\nCE19 RST      1130    142.0     8.0   £210.16\nDF70 UVW       615     58.2    10.6    £86.14\nGH22 XYZ       978    131.4     7.4   £194.47\nJK68 ABC      1402    149.8     9.4   £221.70\n---------------------------------------------\nFleet         4967    577.9     8.6   £855.29\n\nMost efficient: DF70 UVW\nLeast efficient: GH22 XYZ\nVans needing a service: 2\n```\n(Figure 2)\n\nFigure 3 shows the service.txt file produced by a working program.\n```\nCE19 RST\nGH22 XYZ\n```\n(Figure 3)\n\nOpen Q28 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q28FINISHED with the correct file extension for the programming language.",
  "starter": "# Q28\n\ntbl_van = []\ntbl_miles = []\ntbl_litres = []\n\nFILE_IN = \"fleet.txt\"\nFILE_OUT = \"service.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q28.py",
  "solution": "# Q28\n\ntbl_van = []\ntbl_miles = []\ntbl_litres = []\n\nFILE_IN = \"fleet.txt\"\nFILE_OUT = \"service.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nFUEL_PRICE = 1.48\nSERVICE_BELOW = 8\nLAYOUT = \"{:<10}{:>8}{:>9}{:>8}{:>10}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Reads the fleet file into the three arrays\ndef load_fleet(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            parts = line.split(\",\")\n            tbl_van.append(parts[0])\n            tbl_miles.append(int(parts[1]))\n            tbl_litres.append(float(parts[2]))\n    file.close()\n\n\n# Returns the miles travelled for each litre of fuel\ndef miles_per_litre(miles, litres):\n    if litres == 0:\n        return 0.0\n    return miles / litres\n\n\nload_fleet(FILE_IN)\n\n# Display the fleet table\nprint(LAYOUT.format(\"Van\", \"Miles\", \"Litres\", \"MPL\", \"Cost\"))\nprint(\"-\" * 45)\n\ntotal_miles = 0\ntotal_litres = 0.0\ntotal_cost = 0.0\nbest = 0\nworst = 0\nservice = []\n\nfor index in range(len(tbl_van)):\n    efficiency = miles_per_litre(tbl_miles[index], tbl_litres[index])\n    cost = tbl_litres[index] * FUEL_PRICE\n\n    print(LAYOUT.format(tbl_van[index], tbl_miles[index], tbl_litres[index],\n                        round(efficiency, 1), money(cost)))\n\n    total_miles = total_miles + tbl_miles[index]\n    total_litres = total_litres + tbl_litres[index]\n    total_cost = total_cost + cost\n\n    if efficiency > miles_per_litre(tbl_miles[best], tbl_litres[best]):\n        best = index\n    if efficiency < miles_per_litre(tbl_miles[worst], tbl_litres[worst]):\n        worst = index\n\n    if efficiency < SERVICE_BELOW:\n        service.append(tbl_van[index])\n\nprint(\"-\" * 45)\nprint(LAYOUT.format(\"Fleet\", total_miles, round(total_litres, 1),\n                    round(miles_per_litre(total_miles, total_litres), 1),\n                    money(total_cost)))\nprint()\nprint(\"Most efficient:\", tbl_van[best])\nprint(\"Least efficient:\", tbl_van[worst])\n\n# Write the service list\nout = open(FILE_OUT, \"w\")\nfor van in service:\n    out.write(van + \"\\n\")\nout.close()\n\nprint(\"Vans needing a service:\", len(service))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Miles converted to an integer and litres to a real number",
    "description": "Miles converted to an integer and litres to a real number"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Miles per litre calculated as miles / litres",
    "description": "Miles per litre calculated as miles / litres"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept two or three subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Fuel cost calculated as litres * price per litre",
    "description": "Fuel cost calculated as litres * price per litre"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Fleet totals accumulated correctly by any method",
    "description": "Fleet totals accumulated correctly by any method"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Most and least efficient vans both identified correctly (guidance: Two separate comparisons; by any method except hard-coded)",
    "description": "Most and least efficient vans both identified correctly"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Vans below the efficiency limit written to the output file, which is closed",
    "description": "Vans below the efficiency limit written to the output file, which is closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split into its three fields\nA4: Miles converted to an integer and litres to a real number\nA5: The input file is closed\nA6: Miles per litre calculated as miles / litres\nA7: A subprogram is defined and called (guidance: Accept two or three subprograms)\nA8: Fuel cost calculated as litres * price per litre\nA9: Fleet totals accumulated correctly by any method\nA10: Most and least efficient vans both identified correctly (guidance: Two separate comparisons; by any method except hard-coded)\nA11: Vans below the efficiency limit written to the output file, which is closed\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "fleet.txt": "BD21 OPQ,842,96.5\nCE19 RST,1130,142.0\nDF70 UVW,615,58.2\nGH22 XYZ,978,131.4\nJK68 ABC,1402,149.8\n"
  }
 },
 {
  "id": "tmb_q29",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q29 Allotment plan from a file",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "An allotment is divided into a grid of plots.\nA text file stores what is planted in the grid, one row of the grid on each line.\nThe crops on a line are separated by commas, and an empty plot is stored as a hyphen.\n\nThe code file contains these data structures:\n• tbl_plot stores the grid read from the file, as a two-dimensional array.\n\nFigure 1 shows the contents of allotment.txt.\n```\nbeans,-,onions,beans\n-,-,carrots,-\nleeks,onions,-,beans\n```\n(Figure 1)\n\nThe program must:\n• read allotment.txt into the two-dimensional array\n• display the grid with a row number at the start of each line\n• allow a gardener to input a row number, a plot number and a crop\n    – if the row or plot is not in the grid, an appropriate error message is given\n    – if the plot is already planted, an appropriate error message is given\n    – otherwise the crop is planted\n• display how many plots are planted and how many are empty\n• display how many plots hold each crop that appears in the grid\n• write the updated grid back to allotment.txt in the same format\n\nFigure 2 shows the output from a working program.\n```\nRow 1  beans    -        onions   beans    \nRow 2  -        -        carrots  -        \nRow 3  leeks    onions   -        beans    \n\nRow: 2\nPlot: 1\nCrop: squash\nsquash planted\n\nRow 1  beans    -        onions   beans    \nRow 2  squash   -        carrots  -        \nRow 3  leeks    onions   -        beans    \n\nPlanted: 8\nEmpty: 4\nbeans - 3 plot(s)\nonions - 2 plot(s)\nsquash - 1 plot(s)\ncarrots - 1 plot(s)\nleeks - 1 plot(s)\n```\n(Figure 2)\n\nFigure 3 shows the allotment.txt file produced by a working program.\n```\nbeans,-,onions,beans\nsquash,-,carrots,-\nleeks,onions,-,beans\n```\n(Figure 3)\n\nOpen Q29 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q29FINISHED with the correct file extension for the programming language.",
  "starter": "# Q29\n\ntbl_plot = []\n\nFILE_NAME = \"allotment.txt\"\nEMPTY = \"-\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q29.py",
  "solution": "# Q29\n\ntbl_plot = []\n\nFILE_NAME = \"allotment.txt\"\nEMPTY = \"-\"\n\n# --------------------------------------------------\n# Write your code below this line\n\n\n# Reads the grid file into the two-dimensional array\ndef load_grid(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            tbl_plot.append(line.split(\",\"))\n    file.close()\n\n\n# Displays the grid with row numbers\ndef show_grid(grid):\n    for row in range(len(grid)):\n        line = \"Row \" + str(row + 1) + \"  \"\n        for plot in range(len(grid[row])):\n            line = line + \"{:<9}\".format(grid[row][plot])\n        print(line)\n\n\nload_grid(FILE_NAME)\nshow_grid(tbl_plot)\nprint()\n\n# Plant a crop\nrow = int(input(\"Row: \"))\nplot = int(input(\"Plot: \"))\ncrop = input(\"Crop: \")\n\nif row < 1 or row > len(tbl_plot):\n    print(\"That row is not on the allotment\")\nelif plot < 1 or plot > len(tbl_plot[row - 1]):\n    print(\"That plot is not on the allotment\")\nelif tbl_plot[row - 1][plot - 1] != EMPTY:\n    print(\"That plot already holds\", tbl_plot[row - 1][plot - 1])\nelse:\n    tbl_plot[row - 1][plot - 1] = crop\n    print(crop, \"planted\")\n\nprint()\nshow_grid(tbl_plot)\n\n# Count the plots\nplanted = 0\nempty = 0\ncrops = []\ncounts = []\n\nfor row in range(len(tbl_plot)):\n    for plot in range(len(tbl_plot[row])):\n        name = tbl_plot[row][plot]\n        if name == EMPTY:\n            empty = empty + 1\n        else:\n            planted = planted + 1\n\n            # Count how many plots hold this crop\n            found = -1\n            for index in range(len(crops)):\n                if crops[index] == name:\n                    found = index\n            if found == -1:\n                crops.append(name)\n                counts.append(1)\n            else:\n                counts[found] = counts[found] + 1\n\nprint()\nprint(\"Planted:\", planted)\nprint(\"Empty:\", empty)\nfor index in range(len(crops)):\n    print(crops[index], \"-\", counts[index], \"plot(s)\")\n\n# Write the grid back to the file\nout = open(FILE_NAME, \"w\")\nfor row in range(len(tbl_plot)):\n    out.write(\",\".join(tbl_plot[row]) + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The file is opened for reading (guidance: Any valid open for reading)",
    "description": "The file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split on the comma into a row of the array (guidance: The result must be appended as a list, not as a string)",
    "description": "Each line is split on the comma into a row of the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The file is closed after reading",
    "description": "The file is closed after reading"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A loop displays the grid one row per line, with row numbers",
    "description": "A loop displays the grid one row per line, with row numbers"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to test that the row and plot are in the grid (guidance: Both ends of both ranges must be tested)",
    "description": "Relational operators used to test that the row and plot are in the grid"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The plot is tested to see whether it is already planted (guidance: Comparison with the empty marker)",
    "description": "The plot is tested to see whether it is already planted"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The correct element of the two-dimensional array is updated",
    "description": "The correct element of the two-dimensional array is updated"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Planted and empty plots counted correctly after the change",
    "description": "Planted and empty plots counted correctly after the change"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The updated grid is written back in the same comma separated format (guidance: File must be opened for writing and closed)",
    "description": "The updated grid is written back in the same comma separated format"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split on the comma into a row of the array (guidance: The result must be appended as a list, not as a string)\nA4: The file is closed after reading\nA5: A loop displays the grid one row per line, with row numbers\nA6: Relational operators used to test that the row and plot are in the grid (guidance: Both ends of both ranges must be tested)\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: The plot is tested to see whether it is already planted (guidance: Comparison with the empty marker)\nA9: The correct element of the two-dimensional array is updated\nA10: Planted and empty plots counted correctly after the change\nA11: The updated grid is written back in the same comma separated format (guidance: File must be opened for writing and closed)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "2D lists + files",
  "dataFiles": {
   "allotment.txt": "beans,-,onions,beans\n-,-,carrots,-\nleeks,onions,-,beans\n"
  }
 },
 {
  "id": "tmb_q30",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q30 Sensor data validation",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A weather sensor writes a reading to a text file every hour.\nEach line should hold a time and a wind speed in km/h, separated by a comma.\nSome lines are faulty: a field may be missing, or the speed may not be a number, or the speed may be negative.\n\nThe code file contains these data structures:\n• tbl_time stores the times from the valid records.\n• tbl_speed stores the wind speeds from the valid records.\n\nFigure 1 shows the contents of sensor.txt.\n```\n00:00,12\n01:00,15\n02:00,abc\n03:00\n04:00,-4\n05:00,22\n06:00,31\n07:00,\n08:00,28\n```\n(Figure 1)\n\nThe program must:\n• read sensor.txt and check every record\n    – a record with anything other than two fields is faulty\n    – a record whose speed is not a whole number is faulty\n    – a record whose speed is below zero is faulty\n    – valid records are stored in the two arrays\n    – faulty records are written to a file called errors.txt with the reason\n• display a table with:\n    – a header row and a dividing line\n    – each valid time and speed\n• display how many records were read, how many were valid and how many were faulty\n• display the highest wind speed and the time it was recorded\n\nFigure 2 shows the output from a working program.\n```\nTime       Speed\n----------------\n00:00         12\n01:00         15\n05:00         22\n06:00         31\n08:00         28\n----------------\nRecords read: 9\nValid: 5\nFaulty: 4\nHighest speed: 31 km/h at 06:00\n```\n(Figure 2)\n\nFigure 3 shows the errors.txt file produced by a working program.\n```\n02:00,abc - speed is not a whole number\n03:00 - wrong number of fields\n04:00,-4 - speed is below zero\n07:00, - speed is not a whole number\n```\n(Figure 3)\n\nOpen Q30 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q30FINISHED with the correct file extension for the programming language.",
  "starter": "# Q30\n\ntbl_time = []\ntbl_speed = []\n\nFILE_IN = \"sensor.txt\"\nFILE_OUT = \"errors.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q30.py",
  "solution": "# Q30\n\ntbl_time = []\ntbl_speed = []\n\nFILE_IN = \"sensor.txt\"\nFILE_OUT = \"errors.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<8}{:>8}\"\n\n\n# Returns the reason a record is faulty, or an empty string when it is valid\ndef fault_in(parts):\n    if len(parts) != 2:\n        return \"wrong number of fields\"\n    if not parts[1].isdigit() and not (parts[1].startswith(\"-\")\n                                       and parts[1][1:].isdigit()):\n        return \"speed is not a whole number\"\n    if int(parts[1]) < 0:\n        return \"speed is below zero\"\n    return \"\"\n\n\n# Read the file, sorting the good records from the bad\nrecords = 0\nfaults = []\n\nfile = open(FILE_IN, \"r\")\nfor line in file:\n    line = line.strip()\n    if line != \"\":\n        records = records + 1\n        parts = line.split(\",\")\n\n        reason = fault_in(parts)\n        if reason == \"\":\n            tbl_time.append(parts[0])\n            tbl_speed.append(int(parts[1]))\n        else:\n            faults.append(line + \" - \" + reason)\n\nfile.close()\n\n# Display the valid readings\nprint(LAYOUT.format(\"Time\", \"Speed\"))\nprint(\"-\" * 16)\n\nhighest = 0\nfor index in range(len(tbl_time)):\n    print(LAYOUT.format(tbl_time[index], tbl_speed[index]))\n    if tbl_speed[index] > tbl_speed[highest]:\n        highest = index\n\nprint(\"-\" * 16)\nprint(\"Records read:\", records)\nprint(\"Valid:\", len(tbl_time))\nprint(\"Faulty:\", len(faults))\nprint(\"Highest speed:\", tbl_speed[highest], \"km/h at\", tbl_time[highest])\n\n# Write the faulty records to their own file\nout = open(FILE_OUT, \"w\")\nfor line in faults:\n    out.write(line + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split on the comma",
    "description": "Each line is split on the comma"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The speed is converted to an integer only after it has been checked (guidance: No mark if a faulty record would crash the conversion)",
    "description": "The speed is converted to an integer only after it has been checked"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A record without exactly two fields is rejected (guidance: Accept a length test)",
    "description": "A record without exactly two fields is rejected"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A speed that is not a whole number is rejected (guidance: Accept isdigit(), try/except or equivalent)",
    "description": "A speed that is not a whole number is rejected"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to validate a record",
    "description": "A subprogram is defined and called to validate a record"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A negative speed is rejected (guidance: Relational operator with zero)",
    "description": "A negative speed is rejected"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The reason is recorded with each faulty record",
    "description": "The reason is recorded with each faulty record"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Records read, valid and faulty all counted correctly (guidance: Valid + faulty must equal records read)",
    "description": "Records read, valid and faulty all counted correctly"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Highest speed and its time identified correctly (guidance: By any method except hard-coded)",
    "description": "Highest speed and its time identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split on the comma\nA4: The speed is converted to an integer only after it has been checked (guidance: No mark if a faulty record would crash the conversion)\nA5: A record without exactly two fields is rejected (guidance: Accept a length test)\nA6: A speed that is not a whole number is rejected (guidance: Accept isdigit(), try/except or equivalent)\nA7: A subprogram is defined and called to validate a record\nA8: A negative speed is rejected (guidance: Relational operator with zero)\nA9: The reason is recorded with each faulty record\nA10: Records read, valid and faulty all counted correctly (guidance: Valid + faulty must equal records read)\nA11: Highest speed and its time identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "File handling",
  "dataFiles": {
   "sensor.txt": "00:00,12\n01:00,15\n02:00,abc\n03:00\n04:00,-4\n05:00,22\n06:00,31\n07:00,\n08:00,28\n"
  }
 },
 {
  "id": "tmb_q31",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q31 Gym membership fees",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A gym works out the monthly fee for each of its members.\nMember names, their age and the type of membership are stored in three arrays.\nThe basic fee depends on the membership type.\nMembers under 18 or over 65 get a 25% reduction on the basic fee.\nA member who pays for a year in advance gets a further £5 off every month.\n\nThe code file contains these data structures:\n• tbl_member stores the member names.\n• tbl_age stores the ages.\n• tbl_type stores the membership type: Peak, Off-peak or Weekend.\n• tbl_annual stores True for members who pay a year in advance.\n\nThe program must:\n• write a subprogram basic_fee that takes a membership type and returns the basic monthly fee:\n    – Peak: £42.00\n    – Off-peak: £31.50\n    – Weekend: £24.00\n    – any other type: 0 and an error message\n• write a subprogram reduction that takes an age and returns True when a reduction applies\n• write a subprogram monthly_fee that uses the other two subprograms and returns what one member pays each month\n• display a table with:\n    – a header row and a dividing line\n    – each member, their age, their type and their monthly fee\n• display the gym's total monthly income and the average fee\n\nFigure 1 shows the output from a working program.\n```\nMember     Age  Type            Fee\n-----------------------------------\nNoor        17  Peak         £31.50\nOtto        34  Off-peak     £26.50\nPriya       70  Weekend      £18.00\nRhys        28  Peak         £42.00\nUnknown membership type: Platinum\nSuki        45  Platinum      £0.00\nTheo        66  Off-peak     £18.62\n-----------------------------------\nTotal monthly income: £136.62\nAverage fee: £22.77\n```\n(Figure 1)\n\nOpen Q31 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q31FINISHED with the correct file extension for the programming language.",
  "starter": "# Q31\n\ntbl_member = [\"Noor\", \"Otto\", \"Priya\", \"Rhys\", \"Suki\", \"Theo\"]\ntbl_age = [17, 34, 70, 28, 45, 66]\ntbl_type = [\"Peak\", \"Off-peak\", \"Weekend\", \"Peak\", \"Platinum\", \"Off-peak\"]\ntbl_annual = [False, True, False, False, False, True]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q31.py",
  "solution": "# Q31\n\ntbl_member = [\"Noor\", \"Otto\", \"Priya\", \"Rhys\", \"Suki\", \"Theo\"]\ntbl_age = [17, 34, 70, 28, 45, 66]\ntbl_type = [\"Peak\", \"Off-peak\", \"Weekend\", \"Peak\", \"Platinum\", \"Off-peak\"]\ntbl_annual = [False, True, False, False, False, True]\n\n# --------------------------------------------------\n# Write your code below this line\n\nYOUNG = 18\nSENIOR = 65\nREDUCTION = 0.25\nANNUAL_OFF = 5.00\nLAYOUT = \"{:<8}{:>6}{:<12}{:>9}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the basic monthly fee for a membership type\ndef basic_fee(membership):\n    if membership == \"Peak\":\n        return 42.00\n    elif membership == \"Off-peak\":\n        return 31.50\n    elif membership == \"Weekend\":\n        return 24.00\n    else:\n        print(\"Unknown membership type:\", membership)\n        return 0.00\n\n\n# Returns True when a member's age earns a reduction\ndef reduction(age):\n    return age < YOUNG or age > SENIOR\n\n\n# Returns what one member pays each month\ndef monthly_fee(membership, age, annual):\n    fee = basic_fee(membership)\n\n    if reduction(age):\n        fee = fee - fee * REDUCTION\n\n    if annual:\n        fee = fee - ANNUAL_OFF\n\n    if fee < 0:\n        fee = 0.00\n    return fee\n\n\n# Display the membership table\nprint(LAYOUT.format(\"Member\", \"Age\", \"  Type\", \"Fee\"))\nprint(\"-\" * 35)\n\ntotal = 0.0\n\nfor index in range(len(tbl_member)):\n    fee = monthly_fee(tbl_type[index], tbl_age[index], tbl_annual[index])\n    total = total + fee\n\n    print(LAYOUT.format(tbl_member[index], tbl_age[index],\n                        \"  \" + tbl_type[index], money(fee)))\n\nprint(\"-\" * 35)\nprint(\"Total monthly income:\", money(total))\nprint(\"Average fee:\", money(total / len(tbl_member)))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A subprogram is defined that takes a membership type",
    "description": "A subprogram is defined that takes a membership type"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "Selection returns the correct fee for each of the three types (guidance: All three values correct)",
    "description": "Selection returns the correct fee for each of the three types"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "An unknown type produces an error message and no charge",
    "description": "An unknown type produces an error message and no charge"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "A second subprogram is defined that takes an age",
    "description": "A second subprogram is defined that takes an age"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A Boolean operator combines the two age tests (guidance: OR, or nested selection with the same effect)",
    "description": "A Boolean operator combines the two age tests"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A third subprogram is defined that returns one member's fee",
    "description": "A third subprogram is defined that returns one member's fee"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "The fee subprogram calls the basic fee subprogram (guidance: No mark if the fees are repeated inside it)",
    "description": "The fee subprogram calls the basic fee subprogram"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The 25% reduction is applied to the basic fee only",
    "description": "The 25% reduction is applied to the basic fee only"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The annual discount is taken off after the reduction",
    "description": "The annual discount is taken off after the reduction"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Total income and average fee calculated correctly by any method",
    "description": "Total income and average fee calculated correctly by any method"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A subprogram is defined that takes a membership type\nA2: Selection returns the correct fee for each of the three types (guidance: All three values correct)\nA3: An unknown type produces an error message and no charge\nA4: A second subprogram is defined that takes an age\nA5: A Boolean operator combines the two age tests (guidance: OR, or nested selection with the same effect)\nA6: A third subprogram is defined that returns one member's fee\nA7: The fee subprogram calls the basic fee subprogram (guidance: No mark if the fees are repeated inside it)\nA8: The 25% reduction is applied to the basic fee only\nA9: The annual discount is taken off after the reduction\nA10: A loop to all items in an array (guidance: Any loop type)\nA11: Total income and average fee calculated correctly by any method\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Subprograms"
 },
 {
  "id": "tmb_q32",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q32 Taxi fares",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A taxi firm works out the fare for each journey.\nA fare is made up of a flag fall of £3.20, a charge for the distance and a charge for any waiting time.\nThe distance is charged at £1.80 for each of the first 5 miles and £1.20 for every mile after that.\nWaiting time is charged at 35p a minute.\nA journey that starts between 23:00 and 05:59 costs 50% more in total.\n\nThe code file contains these data structures:\n• tbl_journey stores the journey reference numbers.\n• tbl_miles stores the distance of each journey in miles.\n• tbl_wait stores the waiting time in minutes.\n• tbl_hour stores the hour the journey started, from 0 to 23.\n\nThe program must:\n• write a subprogram distance_charge that takes a number of miles and returns the charge for the distance\n• write a subprogram is_night that takes an hour and returns True for a night journey\n• write a subprogram fare_for that uses the other two subprograms and returns the fare for one journey\n• display a table with:\n    – a header row and a dividing line\n    – each journey, its miles, its waiting minutes, NIGHT where it applies and the fare\n• display the total taken for all the journeys and the dearest journey reference\n\nFigure 1 shows the output from a working program.\n```\nJourney   Miles   Wait             Fare\n---------------------------------------\nJ101        3.0      0            £8.60\nJ102        8.5      4           £17.80\nJ103       12.0     12  NIGHT    £37.20\nJ104        1.5      0            £5.90\nJ105        6.0      2  NIGHT    £21.15\nJ106       15.5      9           £27.95\n---------------------------------------\nTotal taken: £118.60\nDearest journey: J103\n```\n(Figure 1)\n\nOpen Q32 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q32FINISHED with the correct file extension for the programming language.",
  "starter": "# Q32\n\ntbl_journey = [\"J101\", \"J102\", \"J103\", \"J104\", \"J105\", \"J106\"]\ntbl_miles = [3.0, 8.5, 12.0, 1.5, 6.0, 15.5]\ntbl_wait = [0, 4, 12, 0, 2, 9]\ntbl_hour = [9, 14, 23, 7, 2, 18]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q32.py",
  "solution": "# Q32\n\ntbl_journey = [\"J101\", \"J102\", \"J103\", \"J104\", \"J105\", \"J106\"]\ntbl_miles = [3.0, 8.5, 12.0, 1.5, 6.0, 15.5]\ntbl_wait = [0, 4, 12, 0, 2, 9]\ntbl_hour = [9, 14, 23, 7, 2, 18]\n\n# --------------------------------------------------\n# Write your code below this line\n\nFLAG_FALL = 3.20\nNEAR_RATE = 1.80\nFAR_RATE = 1.20\nNEAR_MILES = 5\nWAIT_RATE = 0.35\nNIGHT_EXTRA = 0.50\nLAYOUT = \"{:<8}{:>7}{:>7}  {:<7}{:>8}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the charge for the distance travelled\ndef distance_charge(miles):\n    if miles <= NEAR_MILES:\n        return miles * NEAR_RATE\n    else:\n        return NEAR_MILES * NEAR_RATE + (miles - NEAR_MILES) * FAR_RATE\n\n\n# Returns True when a journey starting at this hour counts as a night journey\ndef is_night(hour):\n    return hour >= 23 or hour <= 5\n\n\n# Returns the whole fare for one journey\ndef fare_for(miles, wait, hour):\n    fare = FLAG_FALL + distance_charge(miles) + wait * WAIT_RATE\n\n    if is_night(hour):\n        fare = fare + fare * NIGHT_EXTRA\n\n    return fare\n\n\n# Display the fares table\nprint(LAYOUT.format(\"Journey\", \"Miles\", \"Wait\", \"\", \"Fare\"))\nprint(\"-\" * 39)\n\ntotal = 0.0\ndearest = 0\n\nfor index in range(len(tbl_journey)):\n    fare = fare_for(tbl_miles[index], tbl_wait[index], tbl_hour[index])\n    total = total + fare\n\n    flag = \"\"\n    if is_night(tbl_hour[index]):\n        flag = \"NIGHT\"\n\n    print(LAYOUT.format(tbl_journey[index], tbl_miles[index],\n                        tbl_wait[index], flag, money(fare)))\n\n    if fare > fare_for(tbl_miles[dearest], tbl_wait[dearest], tbl_hour[dearest]):\n        dearest = index\n\nprint(\"-\" * 39)\nprint(\"Total taken:\", money(total))\nprint(\"Dearest journey:\", tbl_journey[dearest])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A subprogram is defined that takes a number of miles",
    "description": "A subprogram is defined that takes a number of miles"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "Journeys of 5 miles or fewer are charged at the near rate (guidance: <= 5 or < 5.0001)",
    "description": "Journeys of 5 miles or fewer are charged at the near rate"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Longer journeys charge the near rate for 5 miles and the far rate for the rest (guidance: No mark if the whole distance is charged at one rate)",
    "description": "Longer journeys charge the near rate for 5 miles and the far rate for the rest"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "A second subprogram is defined that takes an hour",
    "description": "A second subprogram is defined that takes an hour"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A Boolean operator combines the two hour tests (guidance: OR across midnight; 23 and 5 must both count as night)",
    "description": "A Boolean operator combines the two hour tests"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A third subprogram is defined that returns one fare",
    "description": "A third subprogram is defined that returns one fare"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "The fare adds the flag fall, the distance charge and the waiting charge (guidance: Must call the distance subprogram)",
    "description": "The fare adds the flag fall, the distance charge and the waiting charge"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The night surcharge is added to the whole fare, not just the distance",
    "description": "The night surcharge is added to the whole fare, not just the distance"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total taken calculated correctly by any method",
    "description": "Total taken calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Dearest journey identified correctly (guidance: By any method except hard-coded)",
    "description": "Dearest journey identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A subprogram is defined that takes a number of miles\nA2: Journeys of 5 miles or fewer are charged at the near rate (guidance: <= 5 or < 5.0001)\nA3: Longer journeys charge the near rate for 5 miles and the far rate for the rest (guidance: No mark if the whole distance is charged at one rate)\nA4: A second subprogram is defined that takes an hour\nA5: A Boolean operator combines the two hour tests (guidance: OR across midnight; 23 and 5 must both count as night)\nA6: A third subprogram is defined that returns one fare\nA7: The fare adds the flag fall, the distance charge and the waiting charge (guidance: Must call the distance subprogram)\nA8: The night surcharge is added to the whole fare, not just the distance\nA9: A loop to all items in an array (guidance: Any loop type)\nA10: Total taken calculated correctly by any method\nA11: Dearest journey identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Subprograms"
 },
 {
  "id": "tmb_q33",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q33 Parcel postage costs",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A post office works out the cost of sending a parcel.\nThe cost depends on the weight band of the parcel and the zone it is going to.\nThe costs are stored in a two-dimensional array, with one row for each weight band and one column for each zone.\n\nThe code file contains these data structures:\n• tbl_band stores the name of each weight band.\n• tbl_limit stores the heaviest weight in each band, in kilograms.\n• tbl_zone stores the zone names.\n• tbl_cost stores the cost for each weight band and zone.\n\nThe program must:\n• display the whole price list as a table with:\n    – a header row of zone names and a dividing line\n    – each weight band and its cost for every zone\n• allow a clerk to input a weight in kilograms and a zone name\n    – a subprogram must return the row of the weight band the parcel falls into\n    – if the parcel is heavier than the heaviest band, an appropriate error message is given\n    – if the zone is not in tbl_zone, an appropriate error message is given\n    – otherwise the cost of sending the parcel is displayed\n• display the cheapest cost and the dearest cost in the whole price list\n\nFigure 1 shows the output from a working program.\n```\nBand               UK   Europe    World\n---------------------------------------\nUp to 1kg       £3.95    £8.50   £12.75\nUp to 5kg       £5.40   £14.20   £22.00\nUp to 10kg      £8.25   £21.60   £36.40\nUp to 20kg     £12.90   £33.75   £58.00\n---------------------------------------\nWeight in kg: 6.4\nZone: Europe\nCost to send: £21.60\n\nCheapest in the price list: £3.95\nDearest in the price list: £58.00\n```\n(Figure 1)\n\nOpen Q33 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q33FINISHED with the correct file extension for the programming language.",
  "starter": "# Q33\n\ntbl_band = [\"Up to 1kg\", \"Up to 5kg\", \"Up to 10kg\", \"Up to 20kg\"]\ntbl_limit = [1, 5, 10, 20]\ntbl_zone = [\"UK\", \"Europe\", \"World\"]\n\ntbl_cost = [[3.95, 8.50, 12.75],\n            [5.40, 14.20, 22.00],\n            [8.25, 21.60, 36.40],\n            [12.90, 33.75, 58.00]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q33.py",
  "solution": "# Q33\n\ntbl_band = [\"Up to 1kg\", \"Up to 5kg\", \"Up to 10kg\", \"Up to 20kg\"]\ntbl_limit = [1, 5, 10, 20]\ntbl_zone = [\"UK\", \"Europe\", \"World\"]\n\ntbl_cost = [[3.95, 8.50, 12.75],\n            [5.40, 14.20, 22.00],\n            [8.25, 21.60, 36.40],\n            [12.90, 33.75, 58.00]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<12}{:>9}{:>9}{:>9}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the row of the band a weight falls into, or -1 when it is too heavy\ndef band_for(weight):\n    for row in range(len(tbl_limit)):\n        if weight <= tbl_limit[row]:\n            return row\n    return -1\n\n\n# Returns the column of a zone, or -1 when there is no such zone\ndef column_for(name):\n    for column in range(len(tbl_zone)):\n        if tbl_zone[column] == name:\n            return column\n    return -1\n\n\n# Display the whole price list\nprint(LAYOUT.format(\"Band\", tbl_zone[0], tbl_zone[1], tbl_zone[2]))\nprint(\"-\" * 39)\n\ncheapest = tbl_cost[0][0]\ndearest = tbl_cost[0][0]\n\nfor row in range(len(tbl_band)):\n    print(LAYOUT.format(tbl_band[row], money(tbl_cost[row][0]),\n                        money(tbl_cost[row][1]), money(tbl_cost[row][2])))\n\n    for column in range(len(tbl_cost[row])):\n        if tbl_cost[row][column] < cheapest:\n            cheapest = tbl_cost[row][column]\n        if tbl_cost[row][column] > dearest:\n            dearest = tbl_cost[row][column]\n\nprint(\"-\" * 39)\n\n# Price one parcel\nweight = float(input(\"Weight in kg: \"))\nzone = input(\"Zone: \")\n\nrow = band_for(weight)\ncolumn = column_for(zone)\n\nif row == -1:\n    print(\"Too heavy to post\")\nelif column == -1:\n    print(\"No such zone\")\nelse:\n    print(\"Cost to send:\", money(tbl_cost[row][column]))\n\nprint()\nprint(\"Cheapest in the price list:\", money(cheapest))\nprint(\"Dearest in the price list:\", money(dearest))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A value is returned to show that the parcel is too heavy (guidance: Accept -1, a flag or a Boolean)",
    "description": "A value is returned to show that the parcel is too heavy"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all weight bands (guidance: Any loop type)",
    "description": "A loop to all weight bands"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A nested loop to all costs in the two-dimensional array",
    "description": "A nested loop to all costs in the two-dimensional array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row of zone names and a dividing line displayed (guidance: Zone names must come from the array, not be typed again)",
    "description": "Header row of zone names and a dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "One row of the price list displayed for each weight band",
    "description": "One row of the price list displayed for each weight band"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to find the band a weight falls into (guidance: <= so that a weight on a boundary falls in the lower band)",
    "description": "Relational operator used to find the band a weight falls into"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to find the band (guidance: Must return the row)",
    "description": "A subprogram is defined and called to find the band"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error messages for a parcel that is too heavy and for an unknown zone (guidance: Both needed for the mark)",
    "description": "Error messages for a parcel that is too heavy and for an unknown zone"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The cost is read from the array using both the row and the column",
    "description": "The cost is read from the array using both the row and the column"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Cheapest and dearest found by searching the array, not hard-coded",
    "description": "Cheapest and dearest found by searching the array, not hard-coded"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Both the cheapest and the dearest cost are displayed",
    "description": "Both the cheapest and the dearest cost are displayed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A value is returned to show that the parcel is too heavy (guidance: Accept -1, a flag or a Boolean)\nA2: A loop to all weight bands (guidance: Any loop type)\nA3: A nested loop to all costs in the two-dimensional array\nA4: Header row of zone names and a dividing line displayed (guidance: Zone names must come from the array, not be typed again)\nA5: One row of the price list displayed for each weight band\nA6: Relational operator used to find the band a weight falls into (guidance: <= so that a weight on a boundary falls in the lower band)\nA7: A subprogram is defined and called to find the band (guidance: Must return the row)\nA8: Error messages for a parcel that is too heavy and for an unknown zone (guidance: Both needed for the mark)\nA9: The cost is read from the array using both the row and the column\nA10: Cheapest and dearest found by searching the array, not hard-coded\nA11: Both the cheapest and the dearest cost are displayed\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q34",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q34 Savings accounts",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A bank works out how much each saver will have after a number of years.\nInterest is added at the end of every year and is then included in the next year's interest.\nSavers who deposit £5000 or more get a bonus rate that is 0.5% higher.\n\nThe code file contains these data structures:\n• tbl_saver stores the saver names.\n• tbl_deposit stores the amount each saver put in, in pounds.\n• tbl_years stores how many years each saver will leave the money in.\n• tbl_rate stores the basic yearly interest rate as a percentage.\n\nThe program must:\n• write a subprogram rate_for that takes a deposit and a basic rate and returns the rate that saver will get\n• write a subprogram balance_after that takes a deposit, a rate and a number of years and returns the final balance\n• display a table with:\n    – a header row and a dividing line\n    – each saver, their deposit, their rate, their years and their final balance\n    – the word BONUS beside each saver on the bonus rate\n• display the total interest the bank will pay to all savers\n• display the name of the saver who earns the most interest\nA balance grows by rate% each year, so after one year the balance is balance + balance * rate / 100\n\nFigure 1 shows the output from a working program.\n```\nSaver       Deposit   Rate  Years     Balance  \n---------------------------------------------------\nAgnes      £1200.00    2.5      3    £1292.27  \nBilal      £5000.00    3.0      5    £5796.37  BONUS\nCora        £800.00    3.0     10    £1075.13  \nDev       £12500.00    2.3      2   £13081.61  BONUS\nElke       £3400.00    2.2      4    £3709.22  \n---------------------------------------------------\nInterest to be paid: £2054.60\nEarns the most interest: Bilal\n```\n(Figure 1)\n\nOpen Q34 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q34FINISHED with the correct file extension for the programming language.",
  "starter": "# Q34\n\ntbl_saver = [\"Agnes\", \"Bilal\", \"Cora\", \"Dev\", \"Elke\"]\ntbl_deposit = [1200.00, 5000.00, 800.00, 12500.00, 3400.00]\ntbl_years = [3, 5, 10, 2, 4]\ntbl_rate = [2.5, 2.5, 3.0, 1.8, 2.2]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q34.py",
  "solution": "# Q34\n\ntbl_saver = [\"Agnes\", \"Bilal\", \"Cora\", \"Dev\", \"Elke\"]\ntbl_deposit = [1200.00, 5000.00, 800.00, 12500.00, 3400.00]\ntbl_years = [3, 5, 10, 2, 4]\ntbl_rate = [2.5, 2.5, 3.0, 1.8, 2.2]\n\n# --------------------------------------------------\n# Write your code below this line\n\nBONUS_FROM = 5000.00\nBONUS_EXTRA = 0.5\nLAYOUT = \"{:<8}{:>11}{:>7}{:>7}{:>12}  {}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the interest rate a saver will actually get\ndef rate_for(deposit, basic):\n    if deposit >= BONUS_FROM:\n        return basic + BONUS_EXTRA\n    return basic\n\n\n# Returns the balance after the interest for every year has been added\ndef balance_after(deposit, rate, years):\n    balance = deposit\n    for year in range(years):\n        balance = balance + balance * rate / 100\n    return balance\n\n\n# Display the savings table\nprint(LAYOUT.format(\"Saver\", \"Deposit\", \"Rate\", \"Years\", \"Balance\", \"\"))\nprint(\"-\" * 51)\n\ntotal_interest = 0.0\nmost = 0\n\nfor index in range(len(tbl_saver)):\n    rate = rate_for(tbl_deposit[index], tbl_rate[index])\n    balance = balance_after(tbl_deposit[index], rate, tbl_years[index])\n    interest = balance - tbl_deposit[index]\n\n    flag = \"\"\n    if rate > tbl_rate[index]:\n        flag = \"BONUS\"\n\n    print(LAYOUT.format(tbl_saver[index], money(tbl_deposit[index]),\n                        rate, tbl_years[index], money(balance), flag))\n\n    total_interest = total_interest + interest\n\n    best_rate = rate_for(tbl_deposit[most], tbl_rate[most])\n    best_balance = balance_after(tbl_deposit[most], best_rate, tbl_years[most])\n    if interest > best_balance - tbl_deposit[most]:\n        most = index\n\nprint(\"-\" * 51)\nprint(\"Interest to be paid:\", money(total_interest))\nprint(\"Earns the most interest:\", tbl_saver[most])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A subprogram is defined that takes a deposit and a basic rate",
    "description": "A subprogram is defined that takes a deposit and a basic rate"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "Relational operator used to test the deposit against the bonus level (guidance: >= 5000 or > 4999.99)",
    "description": "Relational operator used to test the deposit against the bonus level"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "The bonus rate is the basic rate plus 0.5 (guidance: No mark for a fixed bonus rate)",
    "description": "The bonus rate is the basic rate plus 0.5"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "A second subprogram is defined that returns a balance",
    "description": "A second subprogram is defined that returns a balance"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A loop repeats once for each year (guidance: Any count controlled loop)",
    "description": "A loop repeats once for each year"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Interest is added to the balance each year, not to the original deposit (guidance: The balance must be used in the calculation)",
    "description": "Interest is added to the balance each year, not to the original deposit"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Interest earned calculated as the balance minus the deposit",
    "description": "Interest earned calculated as the balance minus the deposit"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "BONUS shown for every saver on the bonus rate, and no others",
    "description": "BONUS shown for every saver on the bonus rate, and no others"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Total interest for all savers calculated correctly by any method",
    "description": "Total interest for all savers calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Saver earning the most interest identified correctly (guidance: By interest, not by balance; by any method except hard-coded)",
    "description": "Saver earning the most interest identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A subprogram is defined that takes a deposit and a basic rate\nA2: Relational operator used to test the deposit against the bonus level (guidance: >= 5000 or > 4999.99)\nA3: The bonus rate is the basic rate plus 0.5 (guidance: No mark for a fixed bonus rate)\nA4: A second subprogram is defined that returns a balance\nA5: A loop repeats once for each year (guidance: Any count controlled loop)\nA6: Interest is added to the balance each year, not to the original deposit (guidance: The balance must be used in the calculation)\nA7: A loop to all items in an array (guidance: Any loop type)\nA8: Interest earned calculated as the balance minus the deposit\nA9: BONUS shown for every saver on the bonus rate, and no others\nA10: Total interest for all savers calculated correctly by any method\nA11: Saver earning the most interest identified correctly (guidance: By interest, not by balance; by any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Subprograms"
 },
 {
  "id": "tmb_q35",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q35 School trip costing",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A school works out the cost of a trip for each student.\nThe cost is the coach fare plus the entry price, with a reduction for students on free school meals.\nStudents who have not paid a deposit cannot go on the trip.\n\nThe code file contains these data structures:\n• tbl_student stores the student names.\n• tbl_fsm stores True for students on free school meals.\n• tbl_paid stores True for students who have paid their deposit.\n\nThe program must:\n• allow a teacher to input a student name to mark a deposit as paid\n    – if the student is not in the array, an appropriate error message is given\n    – if the deposit is already paid, an appropriate error message is given\n    – otherwise the record is updated\n• display a table with:\n    – a header row and a dividing line\n    – each student, whether they are on free school meals, whether they have paid and what they owe\n    – the words NOT GOING beside any student who has not paid\n• display how many students are going and the total the school will collect\n• display what the trip would raise if every student paid\nThe coach fare is £8.50 and entry costs £11.00.\nStudents on free school meals pay half of the total cost.\n\nFigure 1 shows the output from a working program.\n```\nStudent who has paid: Emir\nEmir marked as paid\n\nStudent    FSM   Paid     Owes  \n--------------------------------------\nAlba     False   True   £19.50  \nBo        True   True    £9.75  \nCian     False  False   £19.50  NOT GOING\nDot      False   True   £19.50  \nEmir      True   True    £9.75  \nFleur    False   True   £19.50  \nGil       True   True    £9.75  \n--------------------------------------\nStudents going: 6\nTotal to collect: £87.75\nIf everyone paid: £107.25\n```\n(Figure 1)\n\nOpen Q35 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q35FINISHED with the correct file extension for the programming language.",
  "starter": "# Q35\n\ntbl_student = [\"Alba\", \"Bo\", \"Cian\", \"Dot\", \"Emir\", \"Fleur\", \"Gil\"]\ntbl_fsm = [False, True, False, False, True, False, True]\ntbl_paid = [True, True, False, True, False, True, True]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q35.py",
  "solution": "# Q35\n\ntbl_student = [\"Alba\", \"Bo\", \"Cian\", \"Dot\", \"Emir\", \"Fleur\", \"Gil\"]\ntbl_fsm = [False, True, False, False, True, False, True]\ntbl_paid = [True, True, False, True, False, True, True]\n\n# --------------------------------------------------\n# Write your code below this line\n\nCOACH = 8.50\nENTRY = 11.00\nFSM_SHARE = 0.5\nLAYOUT = \"{:<8}{:>6}{:>7}{:>9}  {}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns what one student owes for the trip\ndef cost_for(fsm):\n    full = COACH + ENTRY\n    if fsm:\n        return full * FSM_SHARE\n    return full\n\n\n# Mark a deposit as paid\nname = input(\"Student who has paid: \")\n\nfound = -1\nfor index in range(len(tbl_student)):\n    if tbl_student[index] == name:\n        found = index\n\nif found == -1:\n    print(\"Student not on the list\")\nelif tbl_paid[found]:\n    print(name, \"has already paid\")\nelse:\n    tbl_paid[found] = True\n    print(name, \"marked as paid\")\n\n# Display the trip table\nprint()\nprint(LAYOUT.format(\"Student\", \"FSM\", \"Paid\", \"Owes\", \"\"))\nprint(\"-\" * 38)\n\ngoing = 0\ncollected = 0.0\npossible = 0.0\n\nfor index in range(len(tbl_student)):\n    owed = cost_for(tbl_fsm[index])\n    possible = possible + owed\n\n    flag = \"\"\n    if tbl_paid[index]:\n        going = going + 1\n        collected = collected + owed\n    else:\n        flag = \"NOT GOING\"\n\n    print(LAYOUT.format(tbl_student[index], str(tbl_fsm[index]),\n                        str(tbl_paid[index]), money(owed), flag))\n\nprint(\"-\" * 38)\nprint(\"Students going:\", going)\nprint(\"Total to collect:\", money(collected))\nprint(\"If everyone paid:\", money(possible))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The paid array is tested before a deposit is recorded",
    "description": "The paid array is tested before a deposit is recorded"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "The full cost is calculated as the coach fare plus the entry price",
    "description": "The full cost is calculated as the coach fare plus the entry price"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row, dividing line and the count of students going are all displayed (guidance: Any sensible headings)",
    "description": "Header row, dividing line and the count of students going are all displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of the amount owed)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Selection on the free school meals value halves the cost (guidance: Accept == True or the value used directly)",
    "description": "Selection on the free school meals value halves the cost"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the student is not on the list (guidance: Any suitable message)",
    "description": "Error message displayed when the student is not on the list"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The paid array is updated only when the deposit was unpaid",
    "description": "The paid array is updated only when the deposit was unpaid"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Only students who have paid are counted in the total to collect",
    "description": "Only students who have paid are counted in the total to collect"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The amount if everyone paid is calculated from every student",
    "description": "The amount if everyone paid is calculated from every student"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The paid array is tested before a deposit is recorded\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: The full cost is calculated as the coach fare plus the entry price\nA4: Header row, dividing line and the count of students going are all displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of the amount owed)\nA6: Selection on the free school meals value halves the cost (guidance: Accept == True or the value used directly)\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Error message displayed when the student is not on the list (guidance: Any suitable message)\nA9: The paid array is updated only when the deposit was unpaid\nA10: Only students who have paid are counted in the total to collect\nA11: The amount if everyone paid is calculated from every student\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q36",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q36 Treasure grid game",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A game hides treasure on a grid.\nThe grid is stored in a two-dimensional array.\nA square holding treasure stores T, an empty square stores a full stop and a square the player has already tried stores X.\nThe player is told how many pieces of treasure are next to the square they try, counting the squares above, below, left and right.\n\nThe code file contains these data structures:\n• tbl_grid stores the grid.\n\nThe program must:\n• display the grid with row and column numbers\n• allow a player to input a row number and a column number\n    – if the square is not on the grid, an appropriate error message is given\n    – if the square has already been tried, an appropriate error message is given\n    – if the square holds treasure, a message says the treasure has been found\n    – otherwise the number of pieces of treasure next to that square is displayed\n• use a subprogram to count the treasure next to a square\n• mark the square the player tried with X and display the grid again\n• display how many pieces of treasure are still hidden\n\nFigure 1 shows the output from a working program.\n```\n   1 2 3 4\n1  . . T . \n2  . T . . \n3  . . . T \n4  T . . . \n\nRow: 2\nColumn: 3\nTreasure next to this square: 2\n\n   1 2 3 4\n1  . . T . \n2  . T X . \n3  . . . T \n4  T . . . \n\nTreasure still hidden: 4\n```\n(Figure 1)\n\nOpen Q36 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q36FINISHED with the correct file extension for the programming language.",
  "starter": "# Q36\n\ntbl_grid = [[\".\", \".\", \"T\", \".\"],\n            [\".\", \"T\", \".\", \".\"],\n            [\".\", \".\", \".\", \"T\"],\n            [\"T\", \".\", \".\", \".\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q36.py",
  "solution": "# Q36\n\ntbl_grid = [[\".\", \".\", \"T\", \".\"],\n            [\".\", \"T\", \".\", \".\"],\n            [\".\", \".\", \".\", \"T\"],\n            [\"T\", \".\", \".\", \".\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nTREASURE = \"T\"\nTRIED = \"X\"\n\n\n# Displays the grid with row and column numbers\ndef show_grid(grid):\n    print(\"   1 2 3 4\")\n    for row in range(len(grid)):\n        line = str(row + 1) + \"  \"\n        for column in range(len(grid[row])):\n            line = line + grid[row][column] + \" \"\n        print(line)\n\n\n# Returns how many squares next to this one hold treasure\ndef treasure_near(grid, row, column):\n    near = 0\n    if row > 0 and grid[row - 1][column] == TREASURE:\n        near = near + 1\n    if row < len(grid) - 1 and grid[row + 1][column] == TREASURE:\n        near = near + 1\n    if column > 0 and grid[row][column - 1] == TREASURE:\n        near = near + 1\n    if column < len(grid[row]) - 1 and grid[row][column + 1] == TREASURE:\n        near = near + 1\n    return near\n\n\nshow_grid(tbl_grid)\nprint()\n\n# Take a turn\nrow = int(input(\"Row: \"))\ncolumn = int(input(\"Column: \"))\n\nif row < 1 or row > len(tbl_grid) or column < 1 \\\n        or column > len(tbl_grid[0]):\n    print(\"That square is not on the grid\")\nelif tbl_grid[row - 1][column - 1] == TRIED:\n    print(\"You have already tried that square\")\nelse:\n    if tbl_grid[row - 1][column - 1] == TREASURE:\n        print(\"Treasure found!\")\n    else:\n        print(\"Treasure next to this square:\",\n              treasure_near(tbl_grid, row - 1, column - 1))\n\n    tbl_grid[row - 1][column - 1] = TRIED\n    print()\n    show_grid(tbl_grid)\n\n# Count what is left\nhidden = 0\nfor row in range(len(tbl_grid)):\n    for column in range(len(tbl_grid[row])):\n        if tbl_grid[row][column] == TREASURE:\n            hidden = hidden + 1\n\nprint()\nprint(\"Treasure still hidden:\", hidden)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Separate messages for a square off the grid and a square already tried",
    "description": "Separate messages for a square off the grid and a square already tried"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A nested loop to all columns in a row",
    "description": "A nested loop to all columns in a row"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The grid is displayed with row and column numbers",
    "description": "The grid is displayed with row and column numbers"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The square the player tried is marked in the array",
    "description": "The square the player tried is marked in the array"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to test that the square is on the grid (guidance: Both ends of both ranges must be tested)",
    "description": "Relational operators used to test that the square is on the grid"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to display the grid",
    "description": "A subprogram is defined and called to display the grid"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The squares above and below are checked without going off the grid (guidance: Index guarded before it is used)",
    "description": "The squares above and below are checked without going off the grid"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The squares left and right are checked without going off the grid (guidance: Index guarded before it is used)",
    "description": "The squares left and right are checked without going off the grid"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The count of nearby treasure is displayed for an empty square",
    "description": "The count of nearby treasure is displayed for an empty square"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Treasure still hidden counted correctly after the turn",
    "description": "Treasure still hidden counted correctly after the turn"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Separate messages for a square off the grid and a square already tried\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A nested loop to all columns in a row\nA4: The grid is displayed with row and column numbers\nA5: The square the player tried is marked in the array\nA6: Relational operators used to test that the square is on the grid (guidance: Both ends of both ranges must be tested)\nA7: A subprogram is defined and called to display the grid\nA8: The squares above and below are checked without going off the grid (guidance: Index guarded before it is used)\nA9: The squares left and right are checked without going off the grid (guidance: Index guarded before it is used)\nA10: The count of nearby treasure is displayed for an empty square\nA11: Treasure still hidden counted correctly after the turn\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q37",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q37 School council election",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A school holds an election for its council.\nEvery vote is stored on its own line in a text file, as the name of the candidate voted for.\nA vote for anyone who is not a candidate is a spoilt vote.\n\nThe code file contains these data structures:\n• tbl_candidate stores the names of the candidates.\n• tbl_votes stores the number of votes for each candidate, in the same order.\n\nFigure 1 shows the contents of votes.txt.\n```\nFarrah\nGideon\nFarrah\nHolly\nGideon\nFarrah\nnone\nHolly\nFarrah\nGideon\nFarrah\nHolly\nSpiderman\nGideon\nFarrah\n```\n(Figure 1)\n\nThe program must:\n• read votes.txt and count the votes for each candidate\n    – votes for anyone who is not a candidate are counted as spoilt\n• display a table with:\n    – a header row and a dividing line\n    – each candidate, their votes and their share as a percentage to 1 decimal place\n• display the number of votes cast, the number of valid votes and the number spoilt\n• display the name of the winner, or a message that there must be a run-off if two or more candidates tie on the most votes\n• write the result to a file called result.txt\n\nFigure 2 shows the output from a working program.\n```\nCandidate   Votes    Share\n--------------------------\nFarrah          6    46.2%\nGideon          4    30.8%\nHolly           3    23.1%\n--------------------------\nVotes cast: 15\nValid votes: 13\nSpoilt votes: 2\nWinner: Farrah with 6 votes\n```\n(Figure 2)\n\nFigure 3 shows the result.txt file produced by a working program.\n```\nVotes cast: 15\nValid votes: 13\nSpoilt votes: 2\nWinner: Farrah with 6 votes\n```\n(Figure 3)\n\nOpen Q37 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q37FINISHED with the correct file extension for the programming language.",
  "starter": "# Q37\n\ntbl_candidate = [\"Farrah\", \"Gideon\", \"Holly\"]\ntbl_votes = [0, 0, 0]\n\nFILE_IN = \"votes.txt\"\nFILE_OUT = \"result.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q37.py",
  "solution": "# Q37\n\ntbl_candidate = [\"Farrah\", \"Gideon\", \"Holly\"]\ntbl_votes = [0, 0, 0]\n\nFILE_IN = \"votes.txt\"\nFILE_OUT = \"result.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<10}{:>7}{:>9}\"\n\n\n# Returns the position of a candidate, or -1 for a spoilt vote\ndef candidate_at(name):\n    for index in range(len(tbl_candidate)):\n        if tbl_candidate[index] == name:\n            return index\n    return -1\n\n\n# Read the votes\ncast = 0\nspoilt = 0\n\nfile = open(FILE_IN, \"r\")\nfor line in file:\n    line = line.strip()\n    if line != \"\":\n        cast = cast + 1\n        position = candidate_at(line)\n        if position == -1:\n            spoilt = spoilt + 1\n        else:\n            tbl_votes[position] = tbl_votes[position] + 1\nfile.close()\n\nvalid = cast - spoilt\n\n# Display the results table\nprint(LAYOUT.format(\"Candidate\", \"Votes\", \"Share\"))\nprint(\"-\" * 26)\n\nmost = 0\nfor index in range(len(tbl_candidate)):\n    share = 0.0\n    if valid > 0:\n        share = tbl_votes[index] / valid * 100\n\n    print(LAYOUT.format(tbl_candidate[index], tbl_votes[index],\n                        \"{:.1f}%\".format(share)))\n\n    if tbl_votes[index] > tbl_votes[most]:\n        most = index\n\nprint(\"-\" * 26)\n\n# Check for a tie on the most votes\nwinners = []\nfor index in range(len(tbl_candidate)):\n    if tbl_votes[index] == tbl_votes[most]:\n        winners.append(tbl_candidate[index])\n\nresult = []\nresult.append(\"Votes cast: \" + str(cast))\nresult.append(\"Valid votes: \" + str(valid))\nresult.append(\"Spoilt votes: \" + str(spoilt))\n\nif len(winners) == 1:\n    result.append(\"Winner: \" + winners[0] + \" with \"\n                  + str(tbl_votes[most]) + \" votes\")\nelse:\n    result.append(\"Run-off needed between \" + \" and \".join(winners))\n\nfor line in result:\n    print(line)\n\nout = open(FILE_OUT, \"w\")\nfor line in result:\n    out.write(line + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "The vote count for the right candidate is increased by one",
    "description": "The vote count for the right candidate is increased by one"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare a vote with the candidate names",
    "description": "Relational operator used to compare a vote with the candidate names"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Votes for anyone who is not a candidate are counted as spoilt",
    "description": "Votes for anyone who is not a candidate are counted as spoilt"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Each share is calculated out of the valid votes, not the votes cast",
    "description": "Each share is calculated out of the valid votes, not the votes cast"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Every candidate on the most votes is collected",
    "description": "Every candidate on the most votes is collected"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "A single winner or a run-off is reported correctly (guidance: Must test how many candidates share the most votes)",
    "description": "A single winner or a run-off is reported correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: The vote count for the right candidate is increased by one\nA4: The input file is closed\nA5: A loop reads every line of the file\nA6: Relational operator used to compare a vote with the candidate names\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Votes for anyone who is not a candidate are counted as spoilt\nA9: Each share is calculated out of the valid votes, not the votes cast\nA10: Every candidate on the most votes is collected\nA11: A single winner or a run-off is reported correctly (guidance: Must test how many candidates share the most votes)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "votes.txt": "Farrah\nGideon\nFarrah\nHolly\nGideon\nFarrah\nnone\nHolly\nFarrah\nGideon\nFarrah\nHolly\nSpiderman\nGideon\nFarrah\n"
  }
 },
 {
  "id": "tmb_q38",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q38 Share portfolio",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "An investment club tracks the shares it owns.\nCompany names, the number of shares held, the price paid for one share and today's price are stored in four arrays.\nAll prices are in pence.\n\nThe code file contains these data structures:\n• tbl_company stores the company names.\n• tbl_held stores how many shares the club holds.\n• tbl_paid stores the price paid for one share, in pence.\n• tbl_today stores today's price for one share, in pence.\n\nThe program must:\n• allow a member to input a company name and a new price for today\n    – if the company is not in the array, an appropriate error message is given\n    – if the new price is below zero, an appropriate error message is given\n    – otherwise today's price is updated\n• display a table with:\n    – a header row and a dividing line\n    – each company, the shares held, the price paid, today's price, the profit or loss in pounds and the percentage change to 1 decimal place\n• display the value of the whole portfolio today, in pounds\n• display the overall profit or loss in pounds\n• display the name of the best performing holding by percentage change\nThe profit or loss on one holding, in pounds, is shares held * (today's price - price paid) / 100\n\nFigure 1 shows the output from a working program.\n```\nCompany: Castle Rail\nNew price in pence: 291\n\nCompany         Held   Paid  Today     Profit   Change\n------------------------------------------------------\nAldercorp        250    412    508    £240.00   +23.3%\nBexley Oil      1200     88     71   -£204.00   -19.3%\nCastle Rail      480    265    291    £124.80    +9.8%\nDunmore Tech      95   1340   1575    £223.25   +17.5%\n------------------------------------------------------\nPortfolio value today: £5015.05\nOverall profit or loss: £384.05\nBest performer: Aldercorp\n```\n(Figure 1)\n\nOpen Q38 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q38FINISHED with the correct file extension for the programming language.",
  "starter": "# Q38\n\ntbl_company = [\"Aldercorp\", \"Bexley Oil\", \"Castle Rail\", \"Dunmore Tech\"]\ntbl_held = [250, 1200, 480, 95]\ntbl_paid = [412, 88, 265, 1340]\ntbl_today = [508, 71, 265, 1575]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q38.py",
  "solution": "# Q38\n\ntbl_company = [\"Aldercorp\", \"Bexley Oil\", \"Castle Rail\", \"Dunmore Tech\"]\ntbl_held = [250, 1200, 480, 95]\ntbl_paid = [412, 88, 265, 1340]\ntbl_today = [508, 71, 265, 1575]\n\n# --------------------------------------------------\n# Write your code below this line\n\nPENCE = 100\nLAYOUT = \"{:<13}{:>7}{:>7}{:>7}{:>11}{:>9}\"\n\n# Returns an amount of money, with the minus sign in front of a loss\ndef money(amount):\n    if amount < 0:\n        return \"-£{:.2f}\".format(-amount)\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the profit or loss on one holding, in pounds\ndef profit_on(held, paid, today):\n    return held * (today - paid) / PENCE\n\n\n# Returns the percentage change in the price of one share\ndef change_in(paid, today):\n    if paid == 0:\n        return 0.0\n    return (today - paid) / paid * 100\n\n\n# Update a price\nname = input(\"Company: \")\nprice = int(input(\"New price in pence: \"))\n\nfound = -1\nfor index in range(len(tbl_company)):\n    if tbl_company[index] == name:\n        found = index\n\nif found == -1:\n    print(\"Company not held\")\nelif price < 0:\n    print(\"A price cannot be below zero\")\nelse:\n    tbl_today[found] = price\n\n# Display the portfolio table\nprint()\nprint(LAYOUT.format(\"Company\", \"Held\", \"Paid\", \"Today\", \"Profit\", \"Change\"))\nprint(\"-\" * 54)\n\nvalue = 0.0\nprofit = 0.0\nbest = 0\n\nfor index in range(len(tbl_company)):\n    gain = profit_on(tbl_held[index], tbl_paid[index], tbl_today[index])\n    change = change_in(tbl_paid[index], tbl_today[index])\n\n    print(LAYOUT.format(tbl_company[index], tbl_held[index],\n                        tbl_paid[index], tbl_today[index],\n                        money(gain), \"{:+.1f}%\".format(change)))\n\n    value = value + tbl_held[index] * tbl_today[index] / PENCE\n    profit = profit + gain\n\n    if change > change_in(tbl_paid[best], tbl_today[best]):\n        best = index\n\nprint(\"-\" * 54)\nprint(\"Portfolio value today:\", money(value))\nprint(\"Overall profit or loss:\", money(profit))\nprint(\"Best performer:\", tbl_company[best])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The new price is tested to make sure it is not below zero",
    "description": "The new price is tested to make sure it is not below zero"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Profit calculated as shares held * price difference, converted to pounds (guidance: Division by 100 needed)",
    "description": "Profit calculated as shares held * price difference, converted to pounds"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row, dividing line and the portfolio value are all displayed (guidance: Any sensible headings)",
    "description": "Header row, dividing line and the portfolio value are all displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the arrays displayed (guidance: Disregard presence/lack of profit or change)",
    "description": "Rows of the arrays displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare the input company with the array",
    "description": "Relational operator used to compare the input company with the array"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Error message displayed when the company is not held (guidance: Any suitable message)",
    "description": "Error message displayed when the company is not held"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Percentage change calculated from the price paid (guidance: (today - paid) / paid * 100)",
    "description": "Percentage change calculated from the price paid"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Portfolio value calculated from today's prices in pounds",
    "description": "Portfolio value calculated from today's prices in pounds"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Best performer identified by percentage change, not by profit (guidance: By any method except hard-coded)",
    "description": "Best performer identified by percentage change, not by profit"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The new price is tested to make sure it is not below zero\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Profit calculated as shares held * price difference, converted to pounds (guidance: Division by 100 needed)\nA4: Header row, dividing line and the portfolio value are all displayed (guidance: Any sensible headings)\nA5: Rows of the arrays displayed (guidance: Disregard presence/lack of profit or change)\nA6: Relational operator used to compare the input company with the array\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: Error message displayed when the company is not held (guidance: Any suitable message)\nA9: Percentage change calculated from the price paid (guidance: (today - paid) / paid * 100)\nA10: Portfolio value calculated from today's prices in pounds\nA11: Best performer identified by percentage change, not by profit (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists"
 },
 {
  "id": "tmb_q39",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q39 Timetable clashes",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A college checks a draft timetable for clashes.\nThe timetable is stored in a two-dimensional array with one row for each day and one column for each period.\nEach entry stores the name of the room a lesson is in, or a hyphen when there is no lesson.\nA clash happens when the same room is used twice in the same period on the same day, which cannot happen here, or when a room is used for more than four lessons in a week.\n\nThe code file contains these data structures:\n• tbl_day stores the day names.\n• tbl_timetable stores the rooms used, one row for each day.\n\nThe program must:\n• display the timetable with:\n    – a header row of period numbers and a dividing line\n    – each day and the rooms used in each period\n• display how many lessons are timetabled on each day\n• use a subprogram to count how many times a named room is used in the week\n• display each room that is used, with the number of lessons it has, and the word OVERUSED beside any room used more than four times\n• display the busiest day\n\nFigure 1 shows the output from a working program.\n```\nDay       P1    P2    P3    P4    P5  Lessons\n---------------------------------------------\nMon      L12   L12     -   S04   S04        4\nTue      S04     -   L12   L12     -        3\nWed      L12   S04   S04     -   A07        4\nThu        -   A07   L12   S04     -        3\nFri      A07   A07     -     -   L12        3\n---------------------------------------------\n\nL12     7 lesson(s)  OVERUSED\nS04     6 lesson(s)  OVERUSED\nA07     4 lesson(s)  \n\nBusiest day: Mon with 4 lessons\n```\n(Figure 1)\n\nOpen Q39 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q39FINISHED with the correct file extension for the programming language.",
  "starter": "# Q39\n\ntbl_day = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\n\ntbl_timetable = [[\"L12\", \"L12\", \"-\", \"S04\", \"S04\"],\n                 [\"S04\", \"-\", \"L12\", \"L12\", \"-\"],\n                 [\"L12\", \"S04\", \"S04\", \"-\", \"A07\"],\n                 [\"-\", \"A07\", \"L12\", \"S04\", \"-\"],\n                 [\"A07\", \"A07\", \"-\", \"-\", \"L12\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q39.py",
  "solution": "# Q39\n\ntbl_day = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\n\ntbl_timetable = [[\"L12\", \"L12\", \"-\", \"S04\", \"S04\"],\n                 [\"S04\", \"-\", \"L12\", \"L12\", \"-\"],\n                 [\"L12\", \"S04\", \"S04\", \"-\", \"A07\"],\n                 [\"-\", \"A07\", \"L12\", \"S04\", \"-\"],\n                 [\"A07\", \"A07\", \"-\", \"-\", \"L12\"]]\n\n# --------------------------------------------------\n# Write your code below this line\n\nFREE = \"-\"\nMAX_LESSONS = 4\nLAYOUT = \"{:<6}{:>6}{:>6}{:>6}{:>6}{:>6}{:>9}\"\n\n\n# Returns how many lessons a room has in the whole week\ndef room_used(room):\n    used = 0\n    for day in range(len(tbl_timetable)):\n        for period in range(len(tbl_timetable[day])):\n            if tbl_timetable[day][period] == room:\n                used = used + 1\n    return used\n\n\n# Display the timetable\nprint(LAYOUT.format(\"Day\", \"P1\", \"P2\", \"P3\", \"P4\", \"P5\", \"Lessons\"))\nprint(\"-\" * 45)\n\nbusiest = 0\nbusiest_count = 0\nrooms = []\n\nfor day in range(len(tbl_day)):\n    lessons = 0\n    row = tbl_timetable[day]\n\n    for period in range(len(row)):\n        if row[period] != FREE:\n            lessons = lessons + 1\n\n            # Remember each room the first time it is seen\n            seen = False\n            for index in range(len(rooms)):\n                if rooms[index] == row[period]:\n                    seen = True\n            if not seen:\n                rooms.append(row[period])\n\n    print(LAYOUT.format(tbl_day[day], row[0], row[1], row[2],\n                        row[3], row[4], lessons))\n\n    if lessons > busiest_count:\n        busiest_count = lessons\n        busiest = day\n\nprint(\"-\" * 45)\n\n# Report on each room\nprint()\nfor index in range(len(rooms)):\n    used = room_used(rooms[index])\n    flag = \"\"\n    if used > MAX_LESSONS:\n        flag = \"OVERUSED\"\n    print(\"{:<6}{:>3} lesson(s)  {}\".format(rooms[index], used, flag))\n\nprint()\nprint(\"Busiest day:\", tbl_day[busiest], \"with\", busiest_count, \"lessons\")\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Relational operator used to compare a room's lessons with the limit (guidance: > 4 or >= 5)",
    "description": "Relational operator used to compare a room's lessons with the limit"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Any loop type)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A nested loop to all periods in a day",
    "description": "A nested loop to all periods in a day"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Header row of period numbers and a dividing line displayed (guidance: Any sensible headings)",
    "description": "Header row of period numbers and a dividing line displayed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Rows of the array displayed (guidance: Disregard presence/lack of the lesson count)",
    "description": "Rows of the array displayed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare an entry with a room name",
    "description": "Relational operator used to compare an entry with a room name"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to count one room's lessons (guidance: Must return the count)",
    "description": "A subprogram is defined and called to count one room's lessons"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Lessons on a day are counted, ignoring free periods",
    "description": "Lessons on a day are counted, ignoring free periods"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Each room is listed once, however many times it is used (guidance: Any method that avoids duplicates)",
    "description": "Each room is listed once, however many times it is used"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "OVERUSED shown for every room over the limit, and no others",
    "description": "OVERUSED shown for every room over the limit, and no others"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Busiest day identified correctly (guidance: By any method except hard-coded)",
    "description": "Busiest day identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Relational operator used to compare a room's lessons with the limit (guidance: > 4 or >= 5)\nA2: A loop to all rows of the two-dimensional array (guidance: Any loop type)\nA3: A nested loop to all periods in a day\nA4: Header row of period numbers and a dividing line displayed (guidance: Any sensible headings)\nA5: Rows of the array displayed (guidance: Disregard presence/lack of the lesson count)\nA6: Relational operator used to compare an entry with a room name\nA7: A subprogram is defined and called to count one room's lessons (guidance: Must return the count)\nA8: Lessons on a day are counted, ignoring free periods\nA9: Each room is listed once, however many times it is used (guidance: Any method that avoids duplicates)\nA10: OVERUSED shown for every room over the limit, and no others\nA11: Busiest day identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 },
 {
  "id": "tmb_q40",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q40 Tuck shop takings",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A tuck shop records what it sells each day of the week.\nA text file holds one line for each item: its name, its price and the number sold on each of the five days, all separated by commas.\n\nThe code file contains these data structures:\n• tbl_item stores the item names read from the file.\n• tbl_price stores the prices read from the file.\n• tbl_sold stores the numbers sold, as a two-dimensional array with one row for each item.\n• tbl_day stores the day names.\n\nFigure 1 shows the contents of tuck.txt.\n```\nCrisps,0.65,22,18,25,20,31\nApple,0.40,14,12,9,15,11\nCookie,0.75,30,27,33,29,40\nJuice,0.90,19,21,17,24,26\n```\n(Figure 1)\n\nThe program must:\n• read tuck.txt into the three arrays\n• display a table with:\n    – a header row of day names and a dividing line\n    – each item, the number sold on each day and the money that item took in the week\n• display the money taken on each day\n• display the total takings for the week\n• display the name of the best selling item by money taken and the busiest day\n\nFigure 2 shows the output from a working program.\n```\nItem       Mon  Tue  Wed  Thu  Fri   Takings\n--------------------------------------------\nCrisps      22   18   25   20   31    £75.40\nApple       14   12    9   15   11    £24.40\nCookie      30   27   33   29   40   £119.25\nJuice       19   21   17   24   26    £96.30\n--------------------------------------------\n\nMon          £59.50\nTue          £55.65\nWed          £59.90\nThu          £62.35\nFri          £77.95\nWeek        £315.35\n\nBest seller: Cookie\nBusiest day: Fri\n```\n(Figure 2)\n\nOpen Q40 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q40FINISHED with the correct file extension for the programming language.",
  "starter": "# Q40\n\ntbl_item = []\ntbl_price = []\ntbl_sold = []\ntbl_day = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\n\nFILE_IN = \"tuck.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q40.py",
  "solution": "# Q40\n\ntbl_item = []\ntbl_price = []\ntbl_sold = []\ntbl_day = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\n\nFILE_IN = \"tuck.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<9}{:>5}{:>5}{:>5}{:>5}{:>5}{:>10}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Reads the tuck shop file into the three arrays\ndef load_sales(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            parts = line.split(\",\")\n            tbl_item.append(parts[0])\n            tbl_price.append(float(parts[1]))\n\n            # The rest of the line is the row of daily sales\n            row = []\n            for field in range(2, len(parts)):\n                row.append(int(parts[field]))\n            tbl_sold.append(row)\n    file.close()\n\n\nload_sales(FILE_IN)\n\n# Display the sales table\nprint(LAYOUT.format(\"Item\", tbl_day[0], tbl_day[1], tbl_day[2],\n                    tbl_day[3], tbl_day[4], \"Takings\"))\nprint(\"-\" * 44)\n\nday_money = [0.0] * len(tbl_day)\nweek_total = 0.0\nbest = 0\nbest_money = 0.0\n\nfor index in range(len(tbl_item)):\n    row = tbl_sold[index]\n\n    # Money this item took in the week\n    item_money = 0.0\n    for day in range(len(row)):\n        item_money = item_money + row[day] * tbl_price[index]\n        day_money[day] = day_money[day] + row[day] * tbl_price[index]\n\n    print(LAYOUT.format(tbl_item[index], row[0], row[1], row[2],\n                        row[3], row[4], money(item_money)))\n\n    week_total = week_total + item_money\n\n    if item_money > best_money:\n        best_money = item_money\n        best = index\n\nprint(\"-\" * 44)\nprint()\n\n# Show the takings for each day and find the busiest\nbusiest = 0\nfor day in range(len(day_money)):\n    print(\"{:<9}{:>10}\".format(tbl_day[day], money(day_money[day])))\n    if day_money[day] > day_money[busiest]:\n        busiest = day\n\nprint(\"{:<9}{:>10}\".format(\"Week\", money(week_total)))\n\nprint()\nprint(\"Best seller:\", tbl_item[best])\nprint(\"Busiest day:\", tbl_day[busiest])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split on the comma",
    "description": "Each line is split on the comma"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The price is converted to a real number before being stored",
    "description": "The price is converted to a real number before being stored"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The daily sales are converted to integers and stored as a row of the array (guidance: A nested list must be appended, not five separate values)",
    "description": "The daily sales are converted to integers and stored as a row of the array"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Header row of day names and a dividing line displayed (guidance: Day names must come from the array, not be typed again)",
    "description": "Header row of day names and a dividing line displayed"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Takings accumulated for each day separately (guidance: The index must identify the day, not the item)",
    "description": "Takings accumulated for each day separately"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Week total calculated correctly by any method",
    "description": "Week total calculated correctly by any method"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Best seller identified by money taken, not by number sold (guidance: By any method except hard-coded)",
    "description": "Best seller identified by money taken, not by number sold"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split on the comma\nA4: The price is converted to a real number before being stored\nA5: The daily sales are converted to integers and stored as a row of the array (guidance: A nested list must be appended, not five separate values)\nA6: The input file is closed\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Header row of day names and a dividing line displayed (guidance: Day names must come from the array, not be typed again)\nA9: Takings accumulated for each day separately (guidance: The index must identify the day, not the item)\nA10: Week total calculated correctly by any method\nA11: Best seller identified by money taken, not by number sold (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "2D lists + files",
  "dataFiles": {
   "tuck.txt": "Crisps,0.65,22,18,25,20,31\nApple,0.40,14,12,9,15,11\nCookie,0.75,30,27,33,29,40\nJuice,0.90,19,21,17,24,26\n"
  }
 },
 {
  "id": "tmb_q41",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q41 Student ID checker",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A college checks that student ID numbers have been typed in correctly.\nA valid ID is seven characters long.\nThe first two characters are capital letters.\nThe next four characters are digits.\nThe last character is a check digit, which is the total of the four digits divided by 7, taking the remainder.\nFor example, in KM3721X the four digits total 13, and 13 remainder 7 is 6, so the check digit should be 6 and this ID is not valid.\n\nThe code file contains these data structures:\n• tbl_id stores the IDs to be checked.\n\nThe program must:\n• write a subprogram right_shape that takes an ID and returns True when it is seven characters long, starts with two capital letters and has four digits in the middle\n• write a subprogram check_digit that takes an ID and returns the check digit it should have\n• display a table with:\n    – a header row and a dividing line\n    – each ID and either VALID or the reason it is not valid\n• display how many IDs were valid and how many were not\n• display the percentage that were valid to 1 decimal place\n\nFigure 1 shows the output from a working program.\n```\nID        Result\n----------------------------------------\nKM37216   VALID\nAB12343   VALID\nzz99991   NOT VALID - wrong format\nQR4567    NOT VALID - wrong format\nTG81094   VALID\nLP0000X   NOT VALID - check digit should be 0\nMN55553   NOT VALID - check digit should be 6\n----------------------------------------\nValid: 3\nNot valid: 4\nPercentage valid: 42.9%\n```\n(Figure 1)\n\nOpen Q41 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q41FINISHED with the correct file extension for the programming language.",
  "starter": "# Q41\n\ntbl_id = [\"KM37216\", \"AB12343\", \"zz99991\", \"QR4567\", \"TG81094\", \"LP0000X\", \"MN55553\"]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q41.py",
  "solution": "# Q41\n\ntbl_id = [\"KM37216\", \"AB12343\", \"zz99991\", \"QR4567\", \"TG81094\", \"LP0000X\", \"MN55553\"]\n\n# --------------------------------------------------\n# Write your code below this line\n\nID_LENGTH = 7\nDIVISOR = 7\nLAYOUT = \"{:<10}{}\"\n\n\n# Returns True when an ID has the right letters, digits and length\ndef right_shape(code):\n    if len(code) != ID_LENGTH:\n        return False\n\n    if not code[0].isupper() or not code[1].isupper():\n        return False\n\n    for position in range(2, 6):\n        if not code[position].isdigit():\n            return False\n\n    return True\n\n\n# Returns the check digit an ID should end with\ndef check_digit(code):\n    total = 0\n    for position in range(2, 6):\n        total = total + int(code[position])\n    return total % DIVISOR\n\n\n# Check every ID\nprint(LAYOUT.format(\"ID\", \"Result\"))\nprint(\"-\" * 40)\n\nvalid = 0\n\nfor index in range(len(tbl_id)):\n    code = tbl_id[index]\n\n    if not right_shape(code):\n        result = \"NOT VALID - wrong format\"\n    elif code[6] != str(check_digit(code)):\n        result = \"NOT VALID - check digit should be \" + str(check_digit(code))\n    else:\n        result = \"VALID\"\n        valid = valid + 1\n\n    print(LAYOUT.format(code, result))\n\nprint(\"-\" * 40)\nprint(\"Valid:\", valid)\nprint(\"Not valid:\", len(tbl_id) - valid)\nprint(\"Percentage valid: {:.1f}%\".format(valid / len(tbl_id) * 100))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A subprogram is defined that takes an ID and returns a Boolean",
    "description": "A subprogram is defined that takes an ID and returns a Boolean"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "The length of the ID is tested (guidance: Accept != 7 or < 7 and > 7)",
    "description": "The length of the ID is tested"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "The first two characters are tested for capital letters (guidance: isupper(), a range comparison or a list of letters)",
    "description": "The first two characters are tested for capital letters"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "A loop covers the four digit positions (guidance: Positions 2 to 5 counting from zero; accept 3 to 6 counting from one)",
    "description": "A loop covers the four digit positions"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "Each of those characters is tested for being a digit (guidance: isdigit() or equivalent)",
    "description": "Each of those characters is tested for being a digit"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A second subprogram is defined that returns the check digit",
    "description": "A second subprogram is defined that returns the check digit"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "The four digits are converted to integers and totalled (guidance: No mark if the characters are joined as a string)",
    "description": "The four digits are converted to integers and totalled"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The remainder after dividing by 7 is returned (guidance: MOD or %)",
    "description": "The remainder after dividing by 7 is returned"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "A wrong format and a wrong check digit give different messages (guidance: Format must be checked first so the check digit cannot crash)",
    "description": "A wrong format and a wrong check digit give different messages"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Counts and the percentage valid are calculated correctly",
    "description": "Counts and the percentage valid are calculated correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A subprogram is defined that takes an ID and returns a Boolean\nA2: The length of the ID is tested (guidance: Accept != 7 or < 7 and > 7)\nA3: The first two characters are tested for capital letters (guidance: isupper(), a range comparison or a list of letters)\nA4: A loop covers the four digit positions (guidance: Positions 2 to 5 counting from zero; accept 3 to 6 counting from one)\nA5: Each of those characters is tested for being a digit (guidance: isdigit() or equivalent)\nA6: A second subprogram is defined that returns the check digit\nA7: The four digits are converted to integers and totalled (guidance: No mark if the characters are joined as a string)\nA8: The remainder after dividing by 7 is returned (guidance: MOD or %)\nA9: A loop to all items in an array (guidance: Any loop type)\nA10: A wrong format and a wrong check digit give different messages (guidance: Format must be checked first so the check digit cannot crash)\nA11: Counts and the percentage valid are calculated correctly\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Subprograms"
 },
 {
  "id": "tmb_q42",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q42 Fitness assessment",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A sports centre assesses the fitness of its members.\nNames, heights in metres and weights in kilograms are stored in three arrays.\nBody mass index is calculated as weight divided by the square of the height.\nA healthy body mass index is from 18.5 up to but not including 25.\n\nThe code file contains these data structures:\n• tbl_name stores the member names.\n• tbl_height stores the heights in metres.\n• tbl_weight stores the weights in kilograms.\n\nThe program must:\n• write a subprogram bmi that takes a height and a weight and returns the body mass index\n• write a subprogram category that takes a body mass index and returns:\n    – Under for a value below 18.5\n    – Healthy for a value from 18.5 up to but not including 25\n    – Over for a value of 25 or more\n• write a subprogram healthy_weight that takes a height and returns the heaviest healthy weight for that height\n• display a table with:\n    – a header row and a dividing line\n    – each member, their height, their weight, their body mass index to 1 decimal place and their category\n    – for anyone in the Over category, how many kilograms they are above a healthy weight\n• display how many members are in each category\nThe heaviest healthy weight for a height is 24.9 multiplied by the square of the height.\n\nFigure 1 shows the output from a working program.\n```\nMember    Height  Weight    BMI  Category  \n--------------------------------------------------\nAda         1.62    54.0   20.6   Healthy  \nBram        1.78    92.5   29.2      Over  13.6 kg over\nCarys       1.55    41.0   17.1     Under  \nDilip       1.85    78.0   22.8   Healthy  \nEnzo         1.7    83.4   28.9      Over  11.4 kg over\nFatou       1.68    62.0   22.0   Healthy  \n--------------------------------------------------\nUnder: 1\nHealthy: 3\nOver: 2\n```\n(Figure 1)\n\nOpen Q42 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q42FINISHED with the correct file extension for the programming language.",
  "starter": "# Q42\n\ntbl_name = [\"Ada\", \"Bram\", \"Carys\", \"Dilip\", \"Enzo\", \"Fatou\"]\ntbl_height = [1.62, 1.78, 1.55, 1.85, 1.70, 1.68]\ntbl_weight = [54.0, 92.5, 41.0, 78.0, 83.4, 62.0]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q42.py",
  "solution": "# Q42\n\ntbl_name = [\"Ada\", \"Bram\", \"Carys\", \"Dilip\", \"Enzo\", \"Fatou\"]\ntbl_height = [1.62, 1.78, 1.55, 1.85, 1.70, 1.68]\ntbl_weight = [54.0, 92.5, 41.0, 78.0, 83.4, 62.0]\n\n# --------------------------------------------------\n# Write your code below this line\n\nLOW = 18.5\nHIGH = 25\nTOP_HEALTHY = 24.9\nLAYOUT = \"{:<8}{:>8}{:>8}{:>7}{:>10}  {}\"\n\n\n# Returns a body mass index\ndef bmi(height, weight):\n    return weight / (height * height)\n\n\n# Returns the category a body mass index falls into\ndef category(value):\n    if value < LOW:\n        return \"Under\"\n    elif value < HIGH:\n        return \"Healthy\"\n    else:\n        return \"Over\"\n\n\n# Returns the heaviest healthy weight for a height\ndef healthy_weight(height):\n    return TOP_HEALTHY * height * height\n\n\n# Display the assessment table\nprint(LAYOUT.format(\"Member\", \"Height\", \"Weight\", \"BMI\", \"Category\", \"\"))\nprint(\"-\" * 50)\n\nunder = 0\nhealthy = 0\nover = 0\n\nfor index in range(len(tbl_name)):\n    value = bmi(tbl_height[index], tbl_weight[index])\n    group = category(value)\n\n    note = \"\"\n    if group == \"Over\":\n        excess = tbl_weight[index] - healthy_weight(tbl_height[index])\n        note = \"{:.1f} kg over\".format(excess)\n        over = over + 1\n    elif group == \"Healthy\":\n        healthy = healthy + 1\n    else:\n        under = under + 1\n\n    print(LAYOUT.format(tbl_name[index], tbl_height[index], tbl_weight[index],\n                        round(value, 1), group, note))\n\nprint(\"-\" * 50)\nprint(\"Under:\", under)\nprint(\"Healthy:\", healthy)\nprint(\"Over:\", over)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A subprogram is defined that takes a height and a weight",
    "description": "A subprogram is defined that takes a height and a weight"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "Body mass index calculated as weight / height squared (guidance: Accept height * height or height ** 2)",
    "description": "Body mass index calculated as weight / height squared"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "A second subprogram is defined that takes a body mass index",
    "description": "A second subprogram is defined that takes a body mass index"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "Relational operator places a value below 18.5 in the Under category",
    "description": "Relational operator places a value below 18.5 in the Under category"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The Healthy category stops below 25, so 25 is Over (guidance: < 25 needed; <= 25 does not meet the requirement)",
    "description": "The Healthy category stops below 25, so 25 is Over"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A third subprogram is defined that takes a height",
    "description": "A third subprogram is defined that takes a height"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "The heaviest healthy weight is 24.9 * height squared",
    "description": "The heaviest healthy weight is 24.9 * height squared"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The excess weight is shown only for members in the Over category",
    "description": "The excess weight is shown only for members in the Over category"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Each category is counted separately (guidance: Three counters or an array of counts)",
    "description": "Each category is counted separately"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "All three category counts are displayed",
    "description": "All three category counts are displayed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A subprogram is defined that takes a height and a weight\nA2: Body mass index calculated as weight / height squared (guidance: Accept height * height or height ** 2)\nA3: A second subprogram is defined that takes a body mass index\nA4: Relational operator places a value below 18.5 in the Under category\nA5: The Healthy category stops below 25, so 25 is Over (guidance: < 25 needed; <= 25 does not meet the requirement)\nA6: A third subprogram is defined that takes a height\nA7: The heaviest healthy weight is 24.9 * height squared\nA8: A loop to all items in an array (guidance: Any loop type)\nA9: The excess weight is shown only for members in the Over category\nA10: Each category is counted separately (guidance: Three counters or an array of counts)\nA11: All three category counts are displayed\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Subprograms"
 },
 {
  "id": "tmb_q43",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q43 Day of the year",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A program works out which day of the year a date falls on.\n1 January is day 1 and 31 December is day 365, or day 366 in a leap year.\nA year is a leap year when it divides exactly by 4, except for years that divide exactly by 100, unless they also divide exactly by 400.\n\nThe code file contains these data structures:\n• tbl_month stores the month names.\n• tbl_days stores the number of days in each month in a year that is not a leap year.\n\nThe program must:\n• write a subprogram is_leap that takes a year and returns True when it is a leap year\n• write a subprogram days_in that takes a month number and a year and returns how many days that month has\n• write a subprogram day_number that takes a day, a month and a year and returns which day of the year it is\n• allow the user to input a day, a month and a year\n    – if the month is not from 1 to 12, an appropriate error message is given\n    – if the day is not a real day in that month, an appropriate error message is given\n    – otherwise the day of the year and the days left in the year are displayed\n• display a table of the months with:\n    – a header row and a dividing line\n    – each month, its length in the year entered and the day of the year it starts on\n\nFigure 1 shows the output from a working program.\n```\nDay: 9\nMonth (1-12): 3\nYear: 2028\nDay of the year: 69\nDays left in the year: 297\n\nMonth         Days   Starts\n---------------------------\nJanuary         31        1\nFebruary        29       32\nMarch           31       61\nApril           30       92\nMay             31      122\nJune            30      153\nJuly            31      183\nAugust          31      214\nSeptember       30      245\nOctober         31      275\nNovember        30      306\nDecember        31      336\n---------------------------\n```\n(Figure 1)\n\nOpen Q43 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q43FINISHED with the correct file extension for the programming language.",
  "starter": "# Q43\n\ntbl_month = [\"January\", \"February\", \"March\", \"April\", \"May\", \"June\",\n             \"July\", \"August\", \"September\", \"October\", \"November\", \"December\"]\n\ntbl_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q43.py",
  "solution": "# Q43\n\ntbl_month = [\"January\", \"February\", \"March\", \"April\", \"May\", \"June\",\n             \"July\", \"August\", \"September\", \"October\", \"November\", \"December\"]\n\ntbl_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]\n\n# --------------------------------------------------\n# Write your code below this line\n\nMONTHS = 12\nFEBRUARY = 2\nLAYOUT = \"{:<11}{:>7}{:>9}\"\n\n\n# Returns True when a year is a leap year\ndef is_leap(year):\n    if year % 400 == 0:\n        return True\n    if year % 100 == 0:\n        return False\n    return year % 4 == 0\n\n\n# Returns how many days a month has in a given year\ndef days_in(month, year):\n    if month == FEBRUARY and is_leap(year):\n        return tbl_days[month - 1] + 1\n    return tbl_days[month - 1]\n\n\n# Returns which day of the year a date falls on\ndef day_number(day, month, year):\n    total = day\n    for earlier in range(1, month):\n        total = total + days_in(earlier, year)\n    return total\n\n\n# Read a date\nday = int(input(\"Day: \"))\nmonth = int(input(\"Month (1-12): \"))\nyear = int(input(\"Year: \"))\n\nif month < 1 or month > MONTHS:\n    print(\"Month must be from 1 to 12\")\nelif day < 1 or day > days_in(month, year):\n    print(\"That day does not exist in that month\")\nelse:\n    days_this_year = 365\n    if is_leap(year):\n        days_this_year = 366\n\n    number = day_number(day, month, year)\n    print(\"Day of the year:\", number)\n    print(\"Days left in the year:\", days_this_year - number)\n\n# Display the months for the year entered\nprint()\nprint(LAYOUT.format(\"Month\", \"Days\", \"Starts\"))\nprint(\"-\" * 27)\n\nfor month_number in range(1, MONTHS + 1):\n    print(LAYOUT.format(tbl_month[month_number - 1],\n                        days_in(month_number, year),\n                        day_number(1, month_number, year)))\n\nprint(\"-\" * 27)\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "A subprogram is defined that takes a year and returns a Boolean",
    "description": "A subprogram is defined that takes a year and returns a Boolean"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "The 400 year rule is applied (guidance: Must be tested before the 100 year rule)",
    "description": "The 400 year rule is applied"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "The 4 year and 100 year rules are both applied correctly (guidance: 1900 must not be a leap year, 2000 must be)",
    "description": "The 4 year and 100 year rules are both applied correctly"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "A second subprogram is defined that takes a month and a year",
    "description": "A second subprogram is defined that takes a month and a year"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "February gets an extra day only in a leap year",
    "description": "February gets an extra day only in a leap year"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "The month length is read from the array, not written out again (guidance: Index adjusted because months are numbered from 1)",
    "description": "The month length is read from the array, not written out again"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A third subprogram is defined that returns the day of the year",
    "description": "A third subprogram is defined that returns the day of the year"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A loop totals the days in all the months before this one (guidance: Must stop before the month itself)",
    "description": "A loop totals the days in all the months before this one"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Relational operators used to check the month is from 1 to 12 (guidance: Both ends must be tested)",
    "description": "Relational operators used to check the month is from 1 to 12"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The day is checked against the length of that month in that year (guidance: Must call the days in month subprogram, not use 31)",
    "description": "The day is checked against the length of that month in that year"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The table shows each month with its length and start day for the year entered",
    "description": "The table shows each month with its length and start day for the year entered"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: A subprogram is defined that takes a year and returns a Boolean\nA2: The 400 year rule is applied (guidance: Must be tested before the 100 year rule)\nA3: The 4 year and 100 year rules are both applied correctly (guidance: 1900 must not be a leap year, 2000 must be)\nA4: A second subprogram is defined that takes a month and a year\nA5: February gets an extra day only in a leap year\nA6: The month length is read from the array, not written out again (guidance: Index adjusted because months are numbered from 1)\nA7: A third subprogram is defined that returns the day of the year\nA8: A loop totals the days in all the months before this one (guidance: Must stop before the month itself)\nA9: Relational operators used to check the month is from 1 to 12 (guidance: Both ends must be tested)\nA10: The day is checked against the length of that month in that year (guidance: Must call the days in month subprogram, not use 31)\nA11: The table shows each month with its length and start day for the year entered\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Subprograms"
 },
 {
  "id": "tmb_q44",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q44 Helpdesk ticket log",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "An IT helpdesk writes one line to a log file for every ticket it receives.\nEach line holds the ticket reference, the category and the minutes spent on it, separated by commas.\nThe categories are not known in advance, so the program must find them in the file.\n\nThe code file contains these data structures:\n• tbl_category stores each category found in the file.\n• tbl_count stores how many tickets are in that category.\n• tbl_minutes stores the total minutes spent on that category.\n\nFigure 1 shows the contents of tickets.txt.\n```\nT001,Printer,15\nT002,Network,45\nT003,Login,5\nT004,Printer,25\nT005,Network,90\nT006,Login,10\nT007,Printer,20\nT008,Hardware,120\nT009,Login,5\nT010,Network,30\n```\n(Figure 1)\n\nThe program must:\n• read tickets.txt and build the three arrays\n    – a category that has not been seen before is added to the arrays\n    – a category that has been seen before has its count and minutes increased\n• display a table with:\n    – a header row and a dividing line\n    – each category, its tickets, its total minutes, its average minutes to 1 decimal place and its share of all tickets as a percentage to 1 decimal place\n• display the number of tickets and the total time spent in hours and minutes\n• display the category with the most tickets and the category that took the most time\n\nFigure 2 shows the output from a working program.\n```\nCategory    Tickets  Minutes   Average   Share\n----------------------------------------------\nPrinter           3       60      20.0   30.0%\nNetwork           3      165      55.0   30.0%\nLogin             3       20       6.7   30.0%\nHardware          1      120     120.0   10.0%\n----------------------------------------------\nTickets: 10\nTime spent: 6 hours 5 minutes\nMost tickets: Printer\nMost time: Network\n```\n(Figure 2)\n\nOpen Q44 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q44FINISHED with the correct file extension for the programming language.",
  "starter": "# Q44\n\ntbl_category = []\ntbl_count = []\ntbl_minutes = []\n\nFILE_IN = \"tickets.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q44.py",
  "solution": "# Q44\n\ntbl_category = []\ntbl_count = []\ntbl_minutes = []\n\nFILE_IN = \"tickets.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<11}{:>8}{:>9}{:>10}{:>8}\"\n\n\n# Returns the position of a category, or -1 when it has not been seen yet\ndef position_of(name):\n    for index in range(len(tbl_category)):\n        if tbl_category[index] == name:\n            return index\n    return -1\n\n\n# Read the log file and build the arrays\ntickets = 0\n\nfile = open(FILE_IN, \"r\")\nfor line in file:\n    line = line.strip()\n    if line != \"\":\n        parts = line.split(\",\")\n        name = parts[1]\n        minutes = int(parts[2])\n        tickets = tickets + 1\n\n        found = position_of(name)\n        if found == -1:\n            tbl_category.append(name)\n            tbl_count.append(1)\n            tbl_minutes.append(minutes)\n        else:\n            tbl_count[found] = tbl_count[found] + 1\n            tbl_minutes[found] = tbl_minutes[found] + minutes\n\nfile.close()\n\n# Display the summary table\nprint(LAYOUT.format(\"Category\", \"Tickets\", \"Minutes\", \"Average\", \"Share\"))\nprint(\"-\" * 46)\n\ntotal_minutes = 0\nmost_tickets = 0\nmost_time = 0\n\nfor index in range(len(tbl_category)):\n    average = tbl_minutes[index] / tbl_count[index]\n    share = tbl_count[index] / tickets * 100\n\n    print(LAYOUT.format(tbl_category[index], tbl_count[index],\n                        tbl_minutes[index], round(average, 1),\n                        \"{:.1f}%\".format(share)))\n\n    total_minutes = total_minutes + tbl_minutes[index]\n\n    if tbl_count[index] > tbl_count[most_tickets]:\n        most_tickets = index\n    if tbl_minutes[index] > tbl_minutes[most_time]:\n        most_time = index\n\nprint(\"-\" * 46)\nprint(\"Tickets:\", tickets)\nprint(\"Time spent:\", total_minutes // 60, \"hours\", total_minutes % 60, \"minutes\")\nprint(\"Most tickets:\", tbl_category[most_tickets])\nprint(\"Most time:\", tbl_category[most_time])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The minutes are converted to an integer before being used",
    "description": "The minutes are converted to an integer before being used"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare a category with those already found",
    "description": "Relational operator used to compare a category with those already found"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to search for a category",
    "description": "A subprogram is defined and called to search for a category"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A new category is added to all three arrays together (guidance: The arrays must stay the same length)",
    "description": "A new category is added to all three arrays together"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "A repeated category has its count and its minutes both increased",
    "description": "A repeated category has its count and its minutes both increased"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Average minutes calculated as that category's minutes / its tickets",
    "description": "Average minutes calculated as that category's minutes / its tickets"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The category with the most tickets and the one with the most time are both found (guidance: Two separate comparisons; by any method except hard-coded)",
    "description": "The category with the most tickets and the one with the most time are both found"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Each line is split into its three fields\nA4: The minutes are converted to an integer before being used\nA5: A loop reads every line of the file\nA6: Relational operator used to compare a category with those already found\nA7: A subprogram is defined and called to search for a category\nA8: A new category is added to all three arrays together (guidance: The arrays must stay the same length)\nA9: A repeated category has its count and its minutes both increased\nA10: Average minutes calculated as that category's minutes / its tickets\nA11: The category with the most tickets and the one with the most time are both found (guidance: Two separate comparisons; by any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "File handling",
  "dataFiles": {
   "tickets.txt": "T001,Printer,15\nT002,Network,45\nT003,Login,5\nT004,Printer,25\nT005,Network,90\nT006,Login,10\nT007,Printer,20\nT008,Hardware,120\nT009,Login,5\nT010,Network,30\n"
  }
 },
 {
  "id": "tmb_q45",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q45 Password audit",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A school audits the passwords staff have chosen.\nThe passwords are stored in a text file, one on each line.\nA password scores one point for each of these: being at least 10 characters long, containing a digit, containing a capital letter and containing one of the symbols ! ? # or *.\nA password scoring 4 is Strong, 2 or 3 is Medium and 0 or 1 is Weak.\n\nThe code file contains these data structures:\n• tbl_password stores the passwords read from the file.\n\nFigure 1 shows the contents of passwords.txt.\n```\nletmein\nTr0ub4dour!\nSpring2026\nqwerty\nTh1stle#Down\nPassword1\nz\nRiver*Bank7\n```\n(Figure 1)\n\nThe program must:\n• read passwords.txt into the array\n• write a subprogram score_for that takes a password and returns its score\n• display a table with:\n    – a header row and a dividing line\n    – each password, its length, its score and its strength\n• display how many passwords are Strong, Medium and Weak\n• write every Weak password to a file called reset.txt\n• display a message saying how many staff must reset their password\n\nFigure 2 shows the output from a working program.\n```\nPassword        Length  Score Strength\n--------------------------------------\nletmein              7      0     Weak\nTr0ub4dour!         11      4   Strong\nSpring2026          10      3   Medium\nqwerty               6      0     Weak\nTh1stle#Down        12      4   Strong\nPassword1            9      2   Medium\nz                    1      0     Weak\nRiver*Bank7         11      4   Strong\n--------------------------------------\nStrong: 3\nMedium: 2\nWeak: 3\n3 staff must reset their password\n```\n(Figure 2)\n\nFigure 3 shows the reset.txt file produced by a working program.\n```\nletmein\nqwerty\nz\n```\n(Figure 3)\n\nOpen Q45 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q45FINISHED with the correct file extension for the programming language.",
  "starter": "# Q45\n\ntbl_password = []\n\nFILE_IN = \"passwords.txt\"\nFILE_OUT = \"reset.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q45.py",
  "solution": "# Q45\n\ntbl_password = []\n\nFILE_IN = \"passwords.txt\"\nFILE_OUT = \"reset.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nGOOD_LENGTH = 10\nSYMBOLS = \"!?#*\"\nLAYOUT = \"{:<14}{:>8}{:>7}{:>9}\"\n\n\n# Reads the password file into the array\ndef load_passwords(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            tbl_password.append(line)\n    file.close()\n\n\n# Returns the score for one password\ndef score_for(password):\n    score = 0\n\n    if len(password) >= GOOD_LENGTH:\n        score = score + 1\n\n    has_digit = False\n    has_capital = False\n    has_symbol = False\n\n    for character in password:\n        if character.isdigit():\n            has_digit = True\n        if character.isupper():\n            has_capital = True\n        if character in SYMBOLS:\n            has_symbol = True\n\n    if has_digit:\n        score = score + 1\n    if has_capital:\n        score = score + 1\n    if has_symbol:\n        score = score + 1\n\n    return score\n\n\n# Returns the strength for a score\ndef strength_for(score):\n    if score == 4:\n        return \"Strong\"\n    elif score >= 2:\n        return \"Medium\"\n    else:\n        return \"Weak\"\n\n\nload_passwords(FILE_IN)\n\n# Display the audit table\nprint(LAYOUT.format(\"Password\", \"Length\", \"Score\", \"Strength\"))\nprint(\"-\" * 38)\n\nstrong = 0\nmedium = 0\nweak = 0\nresets = []\n\nfor index in range(len(tbl_password)):\n    password = tbl_password[index]\n    score = score_for(password)\n    strength = strength_for(score)\n\n    print(LAYOUT.format(password, len(password), score, strength))\n\n    if strength == \"Strong\":\n        strong = strong + 1\n    elif strength == \"Medium\":\n        medium = medium + 1\n    else:\n        weak = weak + 1\n        resets.append(password)\n\nprint(\"-\" * 38)\nprint(\"Strong:\", strong)\nprint(\"Medium:\", medium)\nprint(\"Weak:\", weak)\n\n# Write the list of passwords that must be reset\nout = open(FILE_OUT, \"w\")\nfor password in resets:\n    out.write(password + \"\\n\")\nout.close()\n\nprint(len(resets), \"staff must reset their password\")\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Passwords are stored in the array",
    "description": "Passwords are stored in the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A point is scored for a password of at least 10 characters (guidance: >= 10 or > 9)",
    "description": "A point is scored for a password of at least 10 characters"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A loop examines every character of a password (guidance: Any loop type)",
    "description": "A loop examines every character of a password"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept two or three subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A point is scored for containing one of the four symbols (guidance: Accept IN, a nested loop or four comparisons)",
    "description": "A point is scored for containing one of the four symbols"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The three strengths are awarded at the right scores (guidance: 4, 2-3 and 0-1)",
    "description": "The three strengths are awarded at the right scores"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Each strength is counted separately",
    "description": "Each strength is counted separately"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Weak passwords are written to the output file, which is closed",
    "description": "Weak passwords are written to the output file, which is closed"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Passwords are stored in the array\nA4: The input file is closed\nA5: A point is scored for a password of at least 10 characters (guidance: >= 10 or > 9)\nA6: A loop examines every character of a password (guidance: Any loop type)\nA7: A subprogram is defined and called (guidance: Accept two or three subprograms)\nA8: A point is scored for containing one of the four symbols (guidance: Accept IN, a nested loop or four comparisons)\nA9: The three strengths are awarded at the right scores (guidance: 4, 2-3 and 0-1)\nA10: Each strength is counted separately\nA11: Weak passwords are written to the output file, which is closed\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "File handling",
  "dataFiles": {
   "passwords.txt": "letmein\nTr0ub4dour!\nSpring2026\nqwerty\nTh1stle#Down\nPassword1\nz\nRiver*Bank7\n"
  }
 },
 {
  "id": "tmb_q46",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q46 Sponsored walk pledges",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A charity records the pledges made for a sponsored walk.\nA text file holds one pledge on each line: the walker's name, the sponsor's name and the amount pledged for each mile, separated by commas.\nEvery walker completed the same distance of 12 miles.\n\nThe code file contains these data structures:\n• tbl_walker stores each walker found in the file.\n• tbl_sponsors stores how many sponsors that walker has.\n• tbl_per_mile stores the total pledged per mile for that walker.\n\nFigure 1 shows the contents of pledges.txt.\n```\nHugo,Mrs Patel,1.50\nIris,Mr Olu,2.00\nHugo,Grandad,5.00\nJay,Ms Reed,0.75\nIris,Aunt Kim,3.25\nHugo,Mr Shah,2.50\nJay,Mrs Diaz,1.20\nIris,Uncle Sam,1.00\n```\n(Figure 1)\n\nThe program must:\n• read pledges.txt and build the three arrays\n    – a walker who has not been seen before is added to the arrays\n    – a walker who has been seen before has their sponsors and pledges increased\n• display a table with:\n    – a header row and a dividing line\n    – each walker, their number of sponsors, their rate per mile and the total they raised\n• display the amount raised in total and the average raised per walker\n• display the name of the walker who raised the most\n• write one line for each walker to a file called raised.txt\nA walker raises their total pledge per mile multiplied by 12 miles.\n\nFigure 2 shows the output from a working program.\n```\nWalker     Sponsors   Per mile    Raised\n----------------------------------------\nHugo              3      £9.00   £108.00\nIris              3      £6.25    £75.00\nJay               2      £1.95    £23.40\n----------------------------------------\nRaised in total: £206.40\nAverage per walker: £68.80\nRaised the most: Hugo\n```\n(Figure 2)\n\nFigure 3 shows the raised.txt file produced by a working program.\n```\nHugo raised £108.00\nIris raised £75.00\nJay raised £23.40\n```\n(Figure 3)\n\nOpen Q46 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q46FINISHED with the correct file extension for the programming language.",
  "starter": "# Q46\n\ntbl_walker = []\ntbl_sponsors = []\ntbl_per_mile = []\n\nMILES = 12\nFILE_IN = \"pledges.txt\"\nFILE_OUT = \"raised.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q46.py",
  "solution": "# Q46\n\ntbl_walker = []\ntbl_sponsors = []\ntbl_per_mile = []\n\nMILES = 12\nFILE_IN = \"pledges.txt\"\nFILE_OUT = \"raised.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nLAYOUT = \"{:<9}{:>10}{:>11}{:>10}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the position of a walker, or -1 when they are new\ndef position_of(name):\n    for index in range(len(tbl_walker)):\n        if tbl_walker[index] == name:\n            return index\n    return -1\n\n\n# Read the pledges\nfile = open(FILE_IN, \"r\")\nfor line in file:\n    line = line.strip()\n    if line != \"\":\n        parts = line.split(\",\")\n        walker = parts[0]\n        rate = float(parts[2])\n\n        found = position_of(walker)\n        if found == -1:\n            tbl_walker.append(walker)\n            tbl_sponsors.append(1)\n            tbl_per_mile.append(rate)\n        else:\n            tbl_sponsors[found] = tbl_sponsors[found] + 1\n            tbl_per_mile[found] = tbl_per_mile[found] + rate\n\nfile.close()\n\n# Display the walkers table\nprint(LAYOUT.format(\"Walker\", \"Sponsors\", \"Per mile\", \"Raised\"))\nprint(\"-\" * 40)\n\ntotal = 0.0\nbest = 0\nreport = []\n\nfor index in range(len(tbl_walker)):\n    raised = tbl_per_mile[index] * MILES\n\n    print(LAYOUT.format(tbl_walker[index], tbl_sponsors[index],\n                        money(tbl_per_mile[index]), money(raised)))\n\n    report.append(tbl_walker[index] + \" raised \" + money(raised))\n    total = total + raised\n\n    if raised > tbl_per_mile[best] * MILES:\n        best = index\n\nprint(\"-\" * 40)\nprint(\"Raised in total:\", money(total))\nprint(\"Average per walker:\", money(total / len(tbl_walker)))\nprint(\"Raised the most:\", tbl_walker[best])\n\n# Write the report file\nout = open(FILE_OUT, \"w\")\nfor line in report:\n    out.write(line + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all items in an array (guidance: Any loop type)",
    "description": "A loop to all items in an array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The pledge is converted to a real number before being used",
    "description": "The pledge is converted to a real number before being used"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operator used to compare a walker with those already found",
    "description": "Relational operator used to compare a walker with those already found"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to search for a walker",
    "description": "A subprogram is defined and called to search for a walker"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "A new walker is added to all three arrays together (guidance: The arrays must stay the same length)",
    "description": "A new walker is added to all three arrays together"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "A repeated walker has their sponsor count and their pledges both increased",
    "description": "A repeated walker has their sponsor count and their pledges both increased"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The amount raised is the pledge per mile multiplied by the distance",
    "description": "The amount raised is the pledge per mile multiplied by the distance"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The walker raising the most is identified correctly (guidance: By any method except hard-coded)",
    "description": "The walker raising the most is identified correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop to all items in an array (guidance: Any loop type)\nA3: Each line is split into its three fields\nA4: The pledge is converted to a real number before being used\nA5: A loop reads every line of the file\nA6: Relational operator used to compare a walker with those already found\nA7: A subprogram is defined and called to search for a walker\nA8: A new walker is added to all three arrays together (guidance: The arrays must stay the same length)\nA9: A repeated walker has their sponsor count and their pledges both increased\nA10: The amount raised is the pledge per mile multiplied by the distance\nA11: The walker raising the most is identified correctly (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "pledges.txt": "Hugo,Mrs Patel,1.50\nIris,Mr Olu,2.00\nHugo,Grandad,5.00\nJay,Ms Reed,0.75\nIris,Aunt Kim,3.25\nHugo,Mr Shah,2.50\nJay,Mrs Diaz,1.20\nIris,Uncle Sam,1.00\n"
  }
 },
 {
  "id": "tmb_q47",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q47 Cycle hire charges",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A cycle hire scheme charges for each hire by the time the bike was out.\nThe first 30 minutes of any hire are free.\nAfter that, each complete 30 minutes, or part of one, costs £1.20.\nA hire of more than 24 hours is charged a late fee of £25.00 instead.\nA text file holds one hire on each line: the bike number, the member number and the minutes the bike was out, separated by commas.\n\nThe code file contains these data structures:\n• tbl_bike stores the bike numbers read from the file.\n• tbl_member stores the member numbers read from the file.\n• tbl_minutes stores the minutes each hire lasted.\n\nFigure 1 shows the contents of hires.txt.\n```\nB014,M2201,22\nB007,M1140,65\nB014,M3098,30\nB022,M2201,185\nB007,M4417,1500\nB031,M1140,48\n```\n(Figure 1)\n\nThe program must:\n• read hires.txt and store the three fields in the three arrays\n• write a subprogram charge_for that takes a number of minutes and returns the charge\n• display a table with:\n    – a header row and a dividing line\n    – each hire's bike, member, minutes, time in hours and minutes, and charge\n    – the word LATE beside any hire charged the late fee\n• display the income from all the hires and how many hires were free\n• display the bike number that was out the longest in total\n\nFigure 2 shows the output from a working program.\n```\nBike   Member   Minutes     Time   Charge  \n---------------------------------------------\nB014   M2201         22   0h 22m    £0.00  \nB007   M1140         65    1h 5m    £2.40  \nB014   M3098         30   0h 30m    £0.00  \nB022   M2201        185    3h 5m    £7.20  \nB007   M4417       1500   25h 0m   £25.00  LATE\nB031   M1140         48   0h 48m    £1.20  \n---------------------------------------------\nIncome: £35.80\nFree hires: 2\nOut the longest: B007 26h 5m\n```\n(Figure 2)\n\nOpen Q47 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q47FINISHED with the correct file extension for the programming language.",
  "starter": "# Q47\n\ntbl_bike = []\ntbl_member = []\ntbl_minutes = []\n\nFILE_IN = \"hires.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q47.py",
  "solution": "# Q47\n\ntbl_bike = []\ntbl_member = []\ntbl_minutes = []\n\nFILE_IN = \"hires.txt\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nFREE_MINUTES = 30\nBLOCK = 30\nBLOCK_COST = 1.20\nDAY_MINUTES = 24 * 60\nLATE_FEE = 25.00\nLAYOUT = \"{:<7}{:<8}{:>8}{:>9}{:>9}  {}\"\n\n# Returns an amount of money with a pound sign and two decimal places\ndef money(amount):\n    return \"£{:.2f}\".format(amount)\n\n\n# Returns the charge for a hire of this many minutes\ndef charge_for(minutes):\n    if minutes > DAY_MINUTES:\n        return LATE_FEE\n\n    if minutes <= FREE_MINUTES:\n        return 0.00\n\n    extra = minutes - FREE_MINUTES\n    blocks = extra // BLOCK\n    if extra % BLOCK > 0:\n        blocks = blocks + 1\n\n    return blocks * BLOCK_COST\n\n\n# Returns a number of minutes as hours and minutes\ndef as_time(minutes):\n    return str(minutes // 60) + \"h \" + str(minutes % 60) + \"m\"\n\n\n# Read the hires\nfile = open(FILE_IN, \"r\")\nfor line in file:\n    line = line.strip()\n    if line != \"\":\n        parts = line.split(\",\")\n        tbl_bike.append(parts[0])\n        tbl_member.append(parts[1])\n        tbl_minutes.append(int(parts[2]))\nfile.close()\n\n# Display the hires table\nprint(LAYOUT.format(\"Bike\", \"Member\", \"Minutes\", \"Time\", \"Charge\", \"\"))\nprint(\"-\" * 45)\n\nincome = 0.0\nfree = 0\n\nfor index in range(len(tbl_bike)):\n    charge = charge_for(tbl_minutes[index])\n\n    flag = \"\"\n    if charge == LATE_FEE:\n        flag = \"LATE\"\n    if charge == 0:\n        free = free + 1\n\n    print(LAYOUT.format(tbl_bike[index], tbl_member[index],\n                        tbl_minutes[index], as_time(tbl_minutes[index]),\n                        money(charge), flag))\n\n    income = income + charge\n\nprint(\"-\" * 45)\nprint(\"Income:\", money(income))\nprint(\"Free hires:\", free)\n\n# Find the bike that was out the longest in total\nbikes = []\ntotals = []\n\nfor index in range(len(tbl_bike)):\n    found = -1\n    for position in range(len(bikes)):\n        if bikes[position] == tbl_bike[index]:\n            found = position\n    if found == -1:\n        bikes.append(tbl_bike[index])\n        totals.append(tbl_minutes[index])\n    else:\n        totals[found] = totals[found] + tbl_minutes[index]\n\nbusiest = 0\nfor position in range(len(totals)):\n    if totals[position] > totals[busiest]:\n        busiest = position\n\nprint(\"Out the longest:\", bikes[busiest], as_time(totals[busiest]))\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split into its three fields",
    "description": "Each line is split into its three fields"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The minutes are converted to an integer before being stored",
    "description": "The minutes are converted to an integer before being stored"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A hire of more than 24 hours is charged the late fee instead (guidance: Must be tested before the usual charge)",
    "description": "A hire of more than 24 hours is charged the late fee instead"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called to work out a charge",
    "description": "A subprogram is defined and called to work out a charge"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The first 30 minutes are free (guidance: <= 30 needed)",
    "description": "The first 30 minutes are free"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "Part of a 30 minute block is charged as a whole block (guidance: Accept MOD, ceiling or integer division of (extra + 29))",
    "description": "Part of a 30 minute block is charged as a whole block"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The charge is the number of blocks multiplied by the block cost",
    "description": "The charge is the number of blocks multiplied by the block cost"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The minutes for each bike are totalled across all its hires (guidance: A bike appearing twice must have its hires added together)",
    "description": "The minutes for each bike are totalled across all its hires"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split into its three fields\nA4: The minutes are converted to an integer before being stored\nA5: The input file is closed\nA6: A hire of more than 24 hours is charged the late fee instead (guidance: Must be tested before the usual charge)\nA7: A subprogram is defined and called to work out a charge\nA8: The first 30 minutes are free (guidance: <= 30 needed)\nA9: Part of a 30 minute block is charged as a whole block (guidance: Accept MOD, ceiling or integer division of (extra + 29))\nA10: The charge is the number of blocks multiplied by the block cost\nA11: The minutes for each bike are totalled across all its hires (guidance: A bike appearing twice must have its hires added together)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Parallel lists + files",
  "dataFiles": {
   "hires.txt": "B014,M2201,22\nB007,M1140,65\nB014,M3098,30\nB022,M2201,185\nB007,M4417,1500\nB031,M1140,48\n"
  }
 },
 {
  "id": "tmb_q48",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q48 Exam hall seating",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "An exam hall is laid out as a grid of desks.\nA text file stores the plan, one row of desks on each line, with the desks separated by commas.\nAn empty desk is stored as a hyphen and a used desk stores a candidate number.\nCandidates must not be seated next to each other in the same row.\n\nThe code file contains these data structures:\n• tbl_hall stores the plan read from the file.\n\nFigure 1 shows the contents of hall.txt.\n```\n4101,-,4102,-,4103\n-,-,-,-,-\n4104,-,-,-,4105\n```\n(Figure 1)\n\nThe program must:\n• read hall.txt into the two-dimensional array\n• display the plan with a row number at the start of each line\n• allow an invigilator to input a candidate number\n    – the candidate is seated at the first empty desk that has no candidate in the desk to its left or to its right\n    – the row and desk number are displayed\n    – if there is no such desk, an appropriate message is displayed\n• display how many desks are used and how many are empty\n• display how many desks are empty but cannot be used because of the rule\n• write the updated plan back to hall.txt in the same format\n\nFigure 2 shows the output from a working program.\n```\nRow 1  4101   -      4102   -      4103   \nRow 2  -      -      -      -      -      \nRow 3  4104   -      -      -      4105   \n\nCandidate number: 4106\nSeated in row 2 at desk 1\n\nRow 1  4101   -      4102   -      4103   \nRow 2  4106   -      -      -      -      \nRow 3  4104   -      -      -      4105   \n\nDesks in use: 6\nDesks empty: 9\nEmpty but unusable: 5\n```\n(Figure 2)\n\nFigure 3 shows the hall.txt file produced by a working program.\n```\n4101,-,4102,-,4103\n4106,-,-,-,-\n4104,-,-,-,4105\n```\n(Figure 3)\n\nOpen Q48 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q48FINISHED with the correct file extension for the programming language.",
  "starter": "# Q48\n\ntbl_hall = []\n\nFILE_NAME = \"hall.txt\"\nEMPTY = \"-\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q48.py",
  "solution": "# Q48\n\ntbl_hall = []\n\nFILE_NAME = \"hall.txt\"\nEMPTY = \"-\"\n\n# --------------------------------------------------\n# Write your code below this line\n\n\n# Reads the plan file into the two-dimensional array\ndef load_hall(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            tbl_hall.append(line.split(\",\"))\n    file.close()\n\n\n# Displays the plan with row numbers\ndef show_hall(hall):\n    for row in range(len(hall)):\n        line = \"Row \" + str(row + 1) + \"  \"\n        for desk in range(len(hall[row])):\n            line = line + \"{:<7}\".format(hall[row][desk])\n        print(line)\n\n\n# Returns True when a desk is empty and has no neighbour in use\ndef can_use(hall, row, desk):\n    if hall[row][desk] != EMPTY:\n        return False\n    if desk > 0 and hall[row][desk - 1] != EMPTY:\n        return False\n    if desk < len(hall[row]) - 1 and hall[row][desk + 1] != EMPTY:\n        return False\n    return True\n\n\nload_hall(FILE_NAME)\nshow_hall(tbl_hall)\nprint()\n\n# Seat a candidate\ncandidate = input(\"Candidate number: \")\n\nseated = False\nfor row in range(len(tbl_hall)):\n    for desk in range(len(tbl_hall[row])):\n        if can_use(tbl_hall, row, desk) and not seated:\n            tbl_hall[row][desk] = candidate\n            print(\"Seated in row\", row + 1, \"at desk\", desk + 1)\n            seated = True\n\nif not seated:\n    print(\"No suitable desk is free\")\n\nprint()\nshow_hall(tbl_hall)\n\n# Count the desks\nused = 0\nempty = 0\nblocked = 0\n\nfor row in range(len(tbl_hall)):\n    for desk in range(len(tbl_hall[row])):\n        if tbl_hall[row][desk] != EMPTY:\n            used = used + 1\n        else:\n            empty = empty + 1\n            if not can_use(tbl_hall, row, desk):\n                blocked = blocked + 1\n\nprint()\nprint(\"Desks in use:\", used)\nprint(\"Desks empty:\", empty)\nprint(\"Empty but unusable:\", blocked)\n\n# Write the plan back to the file\nout = open(FILE_NAME, \"w\")\nfor row in range(len(tbl_hall)):\n    out.write(\",\".join(tbl_hall[row]) + \"\\n\")\nout.close()\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The file is opened for reading (guidance: Any valid open for reading)",
    "description": "The file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split on the comma into a row of the array (guidance: The result must be appended as a list, not as a string)",
    "description": "Each line is split on the comma into a row of the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The file is closed after reading",
    "description": "The file is closed after reading"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A loop displays the plan one row per line, with row numbers",
    "description": "A loop displays the plan one row per line, with row numbers"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "A desk is tested to see whether it is empty",
    "description": "A desk is tested to see whether it is empty"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept two or three subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "The desk to the left is checked without going off the row (guidance: Index guarded before it is used)",
    "description": "The desk to the left is checked without going off the row"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The desk to the right is checked without going off the row (guidance: Index guarded before it is used)",
    "description": "The desk to the right is checked without going off the row"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The candidate is seated at the first suitable desk only (guidance: No mark if the candidate is seated at every suitable desk)",
    "description": "The candidate is seated at the first suitable desk only"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "Empty desks that cannot be used are counted correctly",
    "description": "Empty desks that cannot be used are counted correctly"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split on the comma into a row of the array (guidance: The result must be appended as a list, not as a string)\nA4: The file is closed after reading\nA5: A loop displays the plan one row per line, with row numbers\nA6: A desk is tested to see whether it is empty\nA7: A subprogram is defined and called (guidance: Accept two or three subprograms)\nA8: The desk to the left is checked without going off the row (guidance: Index guarded before it is used)\nA9: The desk to the right is checked without going off the row (guidance: Index guarded before it is used)\nA10: The candidate is seated at the first suitable desk only (guidance: No mark if the candidate is seated at every suitable desk)\nA11: Empty desks that cannot be used are counted correctly\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "2D lists + files",
  "dataFiles": {
   "hall.txt": "4101,-,4102,-,4103\n-,-,-,-,-\n4104,-,-,-,4105\n"
  }
 },
 {
  "id": "tmb_q49",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q49 Tournament results grid",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A five a side tournament stores its results in a text file.\nThe file holds a grid with one row for each home team and one column for each away team.\nEach entry is the score of that match as two numbers separated by a hyphen, for example 3-1.\nA team does not play itself, so those entries store a full stop.\nA match that has not been played yet stores a question mark.\n\nThe code file contains these data structures:\n• tbl_team stores the team names.\n• tbl_result stores the grid of results read from the file.\n\nFigure 1 shows the contents of results.txt.\n```\n.,3-1,2-2,?\n0-2,.,1-0,4-1\n2-2,0-1,.,?\n1-3,2-2,5-0,.\n```\n(Figure 1)\n\nThe program must:\n• read results.txt into the two-dimensional array\n• display the results grid with the team names along the top and down the side\n• use a subprogram to work out the points a team earned from one result, where a win is 3 points and a draw is 1 point\n• display a league table with:\n    – a header row and a dividing line\n    – each team, its games played, its goals for, its goals against and its points\n• display how many matches are still to be played\n• display the name of the team at the top of the table\n\nFigure 2 shows the output from a working program.\n```\nHome        Rockets   Sharks   Tigers   Vipers\n----------------------------------------------\nRockets           .      3-1      2-2        ?\nSharks          0-2        .      1-0      4-1\nTigers          2-2      0-1        .        ?\nVipers          1-3      2-2      5-0        .\n\nTeam        Played   For  Against  Points\n-----------------------------------------\nRockets          5    12        6      11\nSharks           6     9        8      10\nTigers           5     4       11       2\nVipers           4     9        9       4\n-----------------------------------------\nMatches still to play: 2\nTop of the table: Rockets\n```\n(Figure 2)\n\nOpen Q49 in the code editor.\nWrite the code to produce this program with the intended output.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q49FINISHED with the correct file extension for the programming language.",
  "starter": "# Q49\n\ntbl_team = [\"Rockets\", \"Sharks\", \"Tigers\", \"Vipers\"]\ntbl_result = []\n\nFILE_IN = \"results.txt\"\nNOT_PLAYED = \"?\"\nSELF = \".\"\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q49.py",
  "solution": "# Q49\n\ntbl_team = [\"Rockets\", \"Sharks\", \"Tigers\", \"Vipers\"]\ntbl_result = []\n\nFILE_IN = \"results.txt\"\nNOT_PLAYED = \"?\"\nSELF = \".\"\n\n# --------------------------------------------------\n# Write your code below this line\n\nWIN = 3\nDRAW = 1\nLAYOUT = \"{:<10}{:>8}{:>6}{:>9}{:>8}\"\n\n\n# Reads the results grid into the two-dimensional array\ndef load_results(filename):\n    file = open(filename, \"r\")\n    for line in file:\n        line = line.strip()\n        if line != \"\":\n            tbl_result.append(line.split(\",\"))\n    file.close()\n\n\n# Returns the points earned by the team that scored \"scored\"\ndef points_from(scored, conceded):\n    if scored > conceded:\n        return WIN\n    elif scored == conceded:\n        return DRAW\n    else:\n        return 0\n\n\nload_results(FILE_IN)\n\n# Display the results grid\nheader = \"{:<10}\".format(\"Home\")\nfor index in range(len(tbl_team)):\n    header = header + \"{:>9}\".format(tbl_team[index])\nprint(header)\nprint(\"-\" * (10 + 9 * len(tbl_team)))\n\nfor row in range(len(tbl_result)):\n    line = \"{:<10}\".format(tbl_team[row])\n    for column in range(len(tbl_result[row])):\n        line = line + \"{:>9}\".format(tbl_result[row][column])\n    print(line)\n\nprint()\n\n# Build the league table\nplayed = [0] * len(tbl_team)\ngoals_for = [0] * len(tbl_team)\ngoals_against = [0] * len(tbl_team)\npoints = [0] * len(tbl_team)\nto_play = 0\n\nfor row in range(len(tbl_result)):\n    for column in range(len(tbl_result[row])):\n        entry = tbl_result[row][column]\n\n        if entry == NOT_PLAYED:\n            to_play = to_play + 1\n        elif entry != SELF:\n            parts = entry.split(\"-\")\n            home = int(parts[0])\n            away = int(parts[1])\n\n            played[row] = played[row] + 1\n            played[column] = played[column] + 1\n\n            goals_for[row] = goals_for[row] + home\n            goals_against[row] = goals_against[row] + away\n            goals_for[column] = goals_for[column] + away\n            goals_against[column] = goals_against[column] + home\n\n            points[row] = points[row] + points_from(home, away)\n            points[column] = points[column] + points_from(away, home)\n\n# Display the league table\nprint(LAYOUT.format(\"Team\", \"Played\", \"For\", \"Against\", \"Points\"))\nprint(\"-\" * 41)\n\ntop = 0\nfor index in range(len(tbl_team)):\n    print(LAYOUT.format(tbl_team[index], played[index], goals_for[index],\n                        goals_against[index], points[index]))\n    if points[index] > points[top]:\n        top = index\n\nprint(\"-\" * 41)\nprint(\"Matches still to play:\", to_play)\nprint(\"Top of the table:\", tbl_team[top])\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "The input file is opened for reading (guidance: Any valid open for reading)",
    "description": "The input file is opened for reading"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop reads every line of the file",
    "description": "A loop reads every line of the file"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "Each line is split on the comma into a row of the array",
    "description": "Each line is split on the comma into a row of the array"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "The input file is closed",
    "description": "The input file is closed"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "The grid is displayed with the team names along the top and down the side (guidance: Names must come from the array, not be typed again)",
    "description": "The grid is displayed with the team names along the top and down the side"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Relational operators used to decide a win, a draw or a loss",
    "description": "Relational operators used to decide a win, a draw or a loss"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept one or two subprograms)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Matches not yet played are counted and not scored",
    "description": "Matches not yet played are counted and not scored"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "A result is split into the two scores and converted to integers",
    "description": "A result is split into the two scores and converted to integers"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "Each result updates both teams, with the goals the right way round for the away team (guidance: The column index identifies the away team)",
    "description": "Each result updates both teams, with the goals the right way round for the away team"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "The team at the top is identified correctly by points (guidance: By any method except hard-coded)",
    "description": "The team at the top is identified correctly by points"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: The input file is opened for reading (guidance: Any valid open for reading)\nA2: A loop reads every line of the file\nA3: Each line is split on the comma into a row of the array\nA4: The input file is closed\nA5: The grid is displayed with the team names along the top and down the side (guidance: Names must come from the array, not be typed again)\nA6: Relational operators used to decide a win, a draw or a loss\nA7: A subprogram is defined and called (guidance: Accept one or two subprograms)\nA8: Matches not yet played are counted and not scored\nA9: A result is split into the two scores and converted to integers\nA10: Each result updates both teams, with the goals the right way round for the away team (guidance: The column index identifies the away team)\nA11: The team at the top is identified correctly by points (guidance: By any method except hard-coded)\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "2D lists + files",
  "dataFiles": {
   "results.txt": ".,3-1,2-2,?\n0-2,.,1-0,4-1\n2-2,0-1,.,?\n1-3,2-2,5-0,.\n"
  }
 },
 {
  "id": "tmb_q50",
  "unit": "U20B",
  "unitName": "20-Mark Question Bank (Paper 2 Q6 style)",
  "title": "Q50 Two player quiz game",
  "level": "Exam-style",
  "difficulty": "Hard",
  "type": "code",
  "marks": 20,
  "brief": "A quiz game is played by two players taking turns.\nThe questions are stored in a two-dimensional array.\nEach row holds the question, the answer and how many points the question is worth.\nEvery question is used once, in the order they are stored.\nThe player with the most points at the end wins.\n\nThe code file contains these data structures:\n• tbl_quiz stores one row for each question: question, answer, points.\n• tbl_player stores the two player names.\n• tbl_score stores the score of each player.\n\nThe program must:\n• play the whole quiz:\n    – players take turns, starting with the first player in tbl_player\n    – the question and the points on offer are displayed\n    – the player's answer is read\n    – an answer is correct whatever capital letters are used\n    – a correct answer adds the points to that player's score and displays a message\n    – a wrong answer displays the correct answer\n• display a table at the end with:\n    – a header row and a dividing line\n    – each player, how many questions they answered and their score\n• display the name of the winner, or a message that the game is a draw\n\nFigure 1 shows the output from a working program.\n```\nPlayer 1 - question 1 for 2 point(s)\nWhat is the capital of Peru\nYour answer: lima\nCorrect! 2 point(s) to Player 1\n\nPlayer 2 - question 2 for 1 point(s)\nHow many bits are in a byte\nYour answer: 8\nCorrect! 1 point(s) to Player 2\n\nPlayer 1 - question 3 for 3 point(s)\nWhat does CPU stand for\nYour answer: central processing unit\nCorrect! 3 point(s) to Player 1\n\nPlayer 2 - question 4 for 2 point(s)\nWhich planet is closest to the Sun\nYour answer: Venus\nNo, the answer is Mercury\n\nPlayer 1 - question 5 for 1 point(s)\nWhat is 7 times 8\nYour answer: 56\nCorrect! 1 point(s) to Player 1\n\nPlayer 2 - question 6 for 3 point(s)\nWho wrote Matilda\nYour answer: Roald Dahl\nCorrect! 3 point(s) to Player 2\n\nPlayer       Questions   Score\n------------------------------\nPlayer 1             3       6\nPlayer 2             3       4\n------------------------------\nPlayer 1 wins with 6 points\n```\n(Figure 1)\n\nOpen Q50 in the code editor.\nWrite the code to produce this program with the intended output.\nInclude at least one subprogram. Your program must work for any number of questions.\nYou must use the data structures given in the code file.\nYour program should function correctly even if the data in the code file is changed.\nUse techniques to make your code easy to read.\nSave your amended code as Q50FINISHED with the correct file extension for the programming language.",
  "starter": "# Q50\n\ntbl_quiz = [[\"What is the capital of Peru\", \"Lima\", 2],\n            [\"How many bits are in a byte\", \"8\", 1],\n            [\"What does CPU stand for\", \"Central Processing Unit\", 3],\n            [\"Which planet is closest to the Sun\", \"Mercury\", 2],\n            [\"What is 7 times 8\", \"56\", 1],\n            [\"Who wrote Matilda\", \"Roald Dahl\", 3]]\n\ntbl_player = [\"Player 1\", \"Player 2\"]\ntbl_score = [0, 0]\n\n# --------------------------------------------------\n# Write your code below this line\n",
  "starterFileName": "Q50.py",
  "solution": "# Q50\n\ntbl_quiz = [[\"What is the capital of Peru\", \"Lima\", 2],\n            [\"How many bits are in a byte\", \"8\", 1],\n            [\"What does CPU stand for\", \"Central Processing Unit\", 3],\n            [\"Which planet is closest to the Sun\", \"Mercury\", 2],\n            [\"What is 7 times 8\", \"56\", 1],\n            [\"Who wrote Matilda\", \"Roald Dahl\", 3]]\n\ntbl_player = [\"Player 1\", \"Player 2\"]\ntbl_score = [0, 0]\n\n# --------------------------------------------------\n# Write your code below this line\n\nQUESTION = 0\nANSWER = 1\nPOINTS = 2\nLAYOUT = \"{:<10}{:>12}{:>8}\"\n\n\n# Returns True when two answers match, whatever capitals are used\ndef same_answer(given, correct):\n    return given.upper() == correct.upper()\n\n\n# Play the quiz\nasked = [0, 0]\nturn = 0\n\nfor number in range(len(tbl_quiz)):\n    row = tbl_quiz[number]\n\n    print(tbl_player[turn], \"- question\", number + 1,\n          \"for\", row[POINTS], \"point(s)\")\n    print(row[QUESTION])\n\n    reply = input(\"Your answer: \")\n    asked[turn] = asked[turn] + 1\n\n    if same_answer(reply, row[ANSWER]):\n        tbl_score[turn] = tbl_score[turn] + row[POINTS]\n        print(\"Correct!\", row[POINTS], \"point(s) to\", tbl_player[turn])\n    else:\n        print(\"No, the answer is\", row[ANSWER])\n\n    print()\n\n    # Hand over to the other player\n    turn = turn + 1\n    if turn == len(tbl_player):\n        turn = 0\n\n# Display the final scores\nprint(LAYOUT.format(\"Player\", \"Questions\", \"Score\"))\nprint(\"-\" * 30)\n\nfor index in range(len(tbl_player)):\n    print(LAYOUT.format(tbl_player[index], asked[index], tbl_score[index]))\n\nprint(\"-\" * 30)\n\n# Decide the result\nbest = 0\nfor index in range(len(tbl_score)):\n    if tbl_score[index] > tbl_score[best]:\n        best = index\n\ndrawn = False\nfor index in range(len(tbl_score)):\n    if index != best and tbl_score[index] == tbl_score[best]:\n        drawn = True\n\nif drawn:\n    print(\"The game is a draw on\", tbl_score[best], \"points\")\nelse:\n    print(tbl_player[best], \"wins with\", tbl_score[best], \"points\")\n",
  "tests": [],
  "markPoints": [
   {
    "id": "A1",
    "marks": 1,
    "criterion": "Any variable or array for tracking how many questions each player answered",
    "description": "Any variable or array for tracking how many questions each player answered"
   },
   {
    "id": "A2",
    "marks": 1,
    "criterion": "A loop to all rows of the two-dimensional array (guidance: Must use the length of the array, not a fixed six)",
    "description": "A loop to all rows of the two-dimensional array"
   },
   {
    "id": "A3",
    "marks": 1,
    "criterion": "The question and the points on offer are both displayed",
    "description": "The question and the points on offer are both displayed"
   },
   {
    "id": "A4",
    "marks": 1,
    "criterion": "A correct answer adds that question's points to the right player's score",
    "description": "A correct answer adds that question's points to the right player's score"
   },
   {
    "id": "A5",
    "marks": 1,
    "criterion": "A wrong answer displays the correct answer",
    "description": "A wrong answer displays the correct answer"
   },
   {
    "id": "A6",
    "marks": 1,
    "criterion": "Answers are compared without case mattering (guidance: upper(), lower() or equivalent on both)",
    "description": "Answers are compared without case mattering"
   },
   {
    "id": "A7",
    "marks": 1,
    "criterion": "A subprogram is defined and called (guidance: Accept a procedure or a function)",
    "description": "A subprogram is defined and called"
   },
   {
    "id": "A8",
    "marks": 1,
    "criterion": "Turns alternate between the players (guidance: Accept MOD, a flag or an if that resets the turn)",
    "description": "Turns alternate between the players"
   },
   {
    "id": "A9",
    "marks": 1,
    "criterion": "The final table shows each player's questions and score",
    "description": "The final table shows each player's questions and score"
   },
   {
    "id": "A10",
    "marks": 1,
    "criterion": "The highest score is found (guidance: By any method except hard-coded)",
    "description": "The highest score is found"
   },
   {
    "id": "A11",
    "marks": 1,
    "criterion": "A draw is reported instead of a winner when the scores are level",
    "description": "A draw is reported instead of a winner when the scores are level"
   },
   {
    "id": "Levels",
    "marks": 9,
    "criterion": "Levels-based mark (up to 9) for decomposition, logic, use of data structures, readability, flexibility with other data and meeting the requirements - see the bands in the mark scheme",
    "description": "Levels-based mark (up to 9)"
   }
  ],
  "markScheme": "Itemised marks - award one mark for each of:\nA1: Any variable or array for tracking how many questions each player answered\nA2: A loop to all rows of the two-dimensional array (guidance: Must use the length of the array, not a fixed six)\nA3: The question and the points on offer are both displayed\nA4: A correct answer adds that question's points to the right player's score\nA5: A wrong answer displays the correct answer\nA6: Answers are compared without case mattering (guidance: upper(), lower() or equivalent on both)\nA7: A subprogram is defined and called (guidance: Accept a procedure or a function)\nA8: Turns alternate between the players (guidance: Accept MOD, a flag or an if that resets the turn)\nA9: The final table shows each player's questions and score\nA10: The highest score is found (guidance: By any method except hard-coded)\nA11: A draw is reported instead of a winner when the scores are level\n\nAward up to a maximum of nine marks using the levels-based mark scheme below.\nBand 0: No rewardable content\nBand 1 (1-3 marks):\n  - Little attempt to decompose the problem into component parts\n  - Some parts of the logic are clear and appropriate to the problem\n  - Some appropriate use and manipulation of data types, variables, data structures and program constructs\n  - Parts of the code are clear and readable\n  - Finished program will not be flexible enough with other data sets or input\n  - The program meets some of the given requirements\nBand 2 (4-6 marks):\n  - Some attempt to decompose the problem into component parts\n  - Most parts of the logic are clear and mostly appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is mostly appropriate\n  - Code is mostly clear and readable\n  - Finished program will function with some but not all other data sets or input\n  - The program meets most of the given requirements\nBand 3 (7-9 marks):\n  - The problem has been decomposed into component parts\n  - The logic is clear and appropriate to the problem\n  - The use and manipulation of data types, variables, data structures and program constructs is appropriate\n  - Code is clear and readable\n  - Finished program could be used with other data sets or input\n  - The program fully meets the given requirements\n\nTotal for this question: 20 marks (11 itemised + 9 levels-based)",
  "commandWord": "Devise",
  "paper": "Paper 2",
  "examBoard": "Pearson Edexcel",
  "specReference": "Two-dimensional lists"
 }
] as unknown as IGCSETask[];

export function getTwentyMarkBankUnit(): IGCSEUnit {
  return {
    code: "U20B",
    title: "20-Mark Question Bank (Paper 2 Question 6 style)",
    topicGroup: "Past Examination Papers",
    paper: "Paper 2",
    blurb:
      "50 full 20-mark programming questions with the code file to open, data files, model answers and the official-style itemised and levels-based mark scheme: parallel lists, 2D lists, file handling and subprograms.",
    tasks: TWENTY_MARK_BANK_TASKS,
  };
}
