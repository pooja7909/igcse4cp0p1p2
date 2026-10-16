// Learning Hub lessons for Pearson Edexcel IGCSE Computer Science (4CP0), Paper 1 and Paper 2.
// GENERATED: code traces and expected practice outputs were produced by running the code,
// so they are always correct. Edit the lesson source and regenerate rather than editing here.
import type { LearnLesson } from "../components/Learn/learnTypes";

export const LEARN_LESSONS: LearnLesson[] = [
 {
  "id": "p1-binary-denary",
  "paper": "Paper 1",
  "spec": "3.1.1 / 3.1.3",
  "title": "Binary and denary",
  "summary": "Why computers use binary, place values, and converting between binary and denary (0-255).",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Why binary?",
    "body": "Computers are built from billions of tiny switches (transistors) that have **two states**: on and off. So all data - numbers, text, images, sound - and program instructions are stored as **binary**: 1s and 0s.\n\n- One binary digit is a **bit**\n- 8 bits are a **byte**\n- With **n** bits you can make **2^n** different patterns: 8 bits give 256 values (0 to 255)"
   },
   {
    "kind": "explain",
    "title": "Place values",
    "body": "Each bit has a place value that doubles from right to left:\n\n`128  64  32  16  8  4  2  1`\n\nTo convert binary to denary, **add the place values where there is a 1**.\n\n`01101101` = 64 + 32 + 8 + 4 + 1 = **109**"
   },
   {
    "kind": "bits",
    "title": "Explore: click the bits",
    "intro": "Click any bit to switch it between 0 and 1. Watch the denary value change.",
    "mode": "unsigned",
    "bits": 8,
    "target": null,
    "showHex": false
   },
   {
    "kind": "bits",
    "title": "Make 45",
    "intro": "Switch on the right bits to make the denary number 45.",
    "mode": "unsigned",
    "bits": 8,
    "target": 45,
    "showHex": false
   },
   {
    "kind": "explain",
    "title": "Denary to binary",
    "body": "Work from the left: if the place value fits into what is left, write 1 and subtract it; otherwise write 0.\n\n**87**: 128 no (0) - 64 yes, 23 left (1) - 32 no (0) - 16 yes, 7 left (1) - 8 no (0) - 4 yes, 3 left (1) - 2 yes, 1 left (1) - 1 yes (1)\n\nSo 87 = **01010111**"
   },
   {
    "kind": "check",
    "question": "Convert `11110000` to denary.",
    "accept": [
     "240"
    ],
    "hints": [
     "Add the place values with a 1.",
     "128 + 64 + 32 + 16"
    ],
    "explain": "128 + 64 + 32 + 16 = 240."
   },
   {
    "kind": "bits",
    "title": "Make 200",
    "intro": "Now make 200 in 8-bit binary.",
    "mode": "unsigned",
    "bits": 8,
    "target": 200,
    "showHex": false
   },
   {
    "kind": "check",
    "question": "How many different values can 6 bits represent?",
    "options": [
     "6",
     "32",
     "64",
     "128"
    ],
    "answer": 2,
    "hints": [
     "Use 2 to the power of the number of bits.",
     "2^6"
    ],
    "explain": "2^6 = 64 values (0 to 63)."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1b-1",
    "title": "Binary to denary",
    "prompt": "Convert `10000001` to denary.",
    "accept": [
     "129"
    ],
    "hints": [
     "The two 1s are at place values 128 and 1."
    ],
    "solution": "128 + 1 = 129"
   },
   {
    "kind": "answer",
    "id": "p1b-2",
    "title": "Denary to binary",
    "prompt": "Convert 100 to 8-bit binary.",
    "accept": [
     "01100100"
    ],
    "hints": [
     "100 = 64 + 32 + 4.",
     "Put 1s under 64, 32 and 4."
    ],
    "solution": "01100100"
   },
   {
    "kind": "answer",
    "id": "p1b-3",
    "title": "Biggest value",
    "prompt": "What is the largest denary number that can be stored in 8 bits?",
    "accept": [
     "255"
    ],
    "hints": [
     "All bits are 1.",
     "2^8 - 1"
    ],
    "solution": "11111111 = 255"
   }
  ],
  "quiz": [
   {
    "q": "Why do computers use binary?",
    "options": [
     "It is easier for people",
     "Their circuits have two states (on/off)",
     "It uses less memory",
     "It is faster to type"
    ],
    "answer": 1,
    "explain": "Transistors are switches with two states."
   },
   {
    "q": "What is 00001010 in denary?",
    "options": [
     "8",
     "10",
     "12",
     "20"
    ],
    "answer": 1,
    "explain": "8 + 2 = 10."
   },
   {
    "q": "What is 37 in 8-bit binary?",
    "options": [
     "00100101",
     "00100110",
     "00110101",
     "00010101"
    ],
    "answer": 0,
    "explain": "32 + 4 + 1 = 37."
   },
   {
    "q": "How many bits are in a byte?",
    "options": [
     "4",
     "8",
     "16",
     "1024"
    ],
    "answer": 1,
    "explain": "1 byte = 8 bits."
   },
   {
    "q": "How many values can 4 bits represent?",
    "options": [
     "4",
     "8",
     "15",
     "16"
    ],
    "answer": 3,
    "explain": "2^4 = 16."
   }
  ]
 },
 {
  "id": "p1-signed",
  "paper": "Paper 1",
  "spec": "3.1.2",
  "title": "Signed integers: sign and magnitude, two's complement",
  "summary": "Represent negative numbers, and find the highest and lowest values for a number of bits.",
  "minutes": 30,
  "steps": [
   {
    "kind": "explain",
    "title": "Sign and magnitude",
    "body": "The **most significant bit (MSB)** is the **sign**: 0 = positive, 1 = negative. The other bits are the size (magnitude).\n\n- +45 = `0` `0101101`\n- -45 = `1` `0101101`\n\nRange for n bits: **-(2^(n-1) - 1) to +(2^(n-1) - 1)**. For 8 bits: **-127 to +127**.\n\nProblems: there are **two zeros** (00000000 and 10000000) and normal binary addition does not work."
   },
   {
    "kind": "bits",
    "title": "Explore sign and magnitude",
    "intro": "The left bit is now the sign bit. Try making -5.",
    "mode": "signmag",
    "bits": 8,
    "target": -5,
    "showHex": false
   },
   {
    "kind": "explain",
    "title": "Two's complement",
    "body": "In two's complement the MSB has a **negative** place value:\n\n`-128  64  32  16  8  4  2  1`\n\n`10110110` = -128 + 32 + 16 + 4 + 2 = **-74**\n\n**To make a negative number** (e.g. -45):\n1. Write +45 in binary: `00101101`\n2. Flip every bit: `11010010`\n3. Add 1: `11010011`"
   },
   {
    "kind": "bits",
    "title": "Explore two's complement",
    "intro": "The left bit is worth -128. Make -45.",
    "mode": "twos",
    "bits": 8,
    "target": -45,
    "showHex": false
   },
   {
    "kind": "explain",
    "title": "Highest and lowest values",
    "body": "For **n bits** in two's complement:\n\n- lowest = **-2^(n-1)**, highest = **2^(n-1) - 1**\n- 8 bits: -128 to +127\n- 5 bits: -16 to +15\n- 12 bits: -2048 to +2047\n\nThere is one more negative value than positive because zero uses a 'positive' pattern.",
    "tip": "Exam tip: always say which representation - the ranges are different for sign and magnitude."
   },
   {
    "kind": "check",
    "question": "What is the lowest value in 8-bit two's complement?",
    "options": [
     "-127",
     "-128",
     "-255",
     "0"
    ],
    "answer": 1,
    "hints": [
     "The MSB is worth -128.",
     "Only the MSB on: 10000000"
    ],
    "explain": "10000000 = -128."
   },
   {
    "kind": "check",
    "question": "What is the highest value in 6-bit sign and magnitude?",
    "accept": [
     "31",
     "+31"
    ],
    "hints": [
     "One bit is the sign, so 5 bits for the size.",
     "5 bits can make up to 31."
    ],
    "explain": "11111 = 31, so the range is -31 to +31."
   },
   {
    "kind": "bits",
    "title": "Challenge: make -1",
    "intro": "In two's complement, which pattern is -1?",
    "mode": "twos",
    "bits": 8,
    "target": -1,
    "showHex": false
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1s-1",
    "title": "Two's complement to denary",
    "prompt": "What is `11111001` in 8-bit two's complement?",
    "accept": [
     "-7"
    ],
    "hints": [
     "-128 + 64 + 32 + 16 + 8 + 1",
     "= -128 + 121"
    ],
    "solution": "-128 + 121 = -7"
   },
   {
    "kind": "answer",
    "id": "p1s-2",
    "title": "Make it negative",
    "prompt": "Give -20 in 8-bit two's complement.",
    "accept": [
     "11101100"
    ],
    "hints": [
     "+20 = 00010100. Flip the bits, then add 1.",
     "Flipped: 11101011"
    ],
    "solution": "11101011 + 1 = 11101100"
   },
   {
    "kind": "answer",
    "id": "p1s-3",
    "title": "Range",
    "prompt": "What is the lowest value in 4-bit two's complement?",
    "accept": [
     "-8"
    ],
    "hints": [
     "-2^(n-1)",
     "-2^3"
    ],
    "solution": "-8 (range -8 to +7)"
   }
  ],
  "quiz": [
   {
    "q": "In sign and magnitude, what does the MSB show?",
    "options": [
     "The size",
     "The sign",
     "Overflow",
     "Parity"
    ],
    "answer": 1,
    "explain": "0 positive, 1 negative."
   },
   {
    "q": "What is 10000101 in 8-bit sign and magnitude?",
    "options": [
     "-5",
     "133",
     "-123",
     "5"
    ],
    "answer": 0,
    "explain": "Sign 1 (negative), magnitude 5."
   },
   {
    "q": "What is 10000101 in 8-bit two's complement?",
    "options": [
     "-5",
     "-123",
     "133",
     "-128"
    ],
    "answer": 1,
    "explain": "-128 + 4 + 1 = -123."
   },
   {
    "q": "Range of 8-bit two's complement?",
    "options": [
     "0 to 255",
     "-127 to 127",
     "-128 to 127",
     "-128 to 128"
    ],
    "answer": 2,
    "explain": "-2^7 to 2^7 - 1."
   },
   {
    "q": "A disadvantage of sign and magnitude:",
    "options": [
     "It cannot store negatives",
     "It has two zeros",
     "It uses 9 bits",
     "It is the same as hex"
    ],
    "answer": 1,
    "explain": "+0 and -0."
   }
  ]
 },
 {
  "id": "p1-binary-arithmetic",
  "paper": "Paper 1",
  "spec": "3.1.4",
  "title": "Binary addition, overflow and shifts",
  "summary": "Add binary numbers, spot overflow, and use logical and arithmetic shifts.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Binary addition rules",
    "body": "- 0 + 0 = 0\n- 0 + 1 = 1\n- 1 + 1 = 0 carry 1\n- 1 + 1 + 1 = 1 carry 1\n\nWork from the **right**, carrying to the next column.\n\n`00110101 + 01001110 = 10000011` (53 + 78 = 131)"
   },
   {
    "kind": "explain",
    "title": "Overflow",
    "body": "**Overflow** happens when the result is too big for the number of bits available. A carry out of the leftmost bit is lost and the stored result is wrong.\n\n`10110110 + 01101101` = 182 + 109 = 291, but 8 bits hold at most 255. The register keeps `00100011` (35).\n\nIn two's complement, adding two positives that gives a negative result also means overflow."
   },
   {
    "kind": "stepper",
    "title": "Logical shifts",
    "intro": "Step through a logical left shift of 2 and a right shift of 1.",
    "frames": [
     {
      "caption": "Start: 00010110 = 22",
      "array": [
       "0",
       "0",
       "0",
       "1",
       "0",
       "1",
       "1",
       "0"
      ]
     },
     {
      "caption": "Logical left shift by 1: every bit moves left, a 0 fills the right. 00101100 = 44 (x2)",
      "array": [
       "0",
       "0",
       "1",
       "0",
       "1",
       "1",
       "0",
       "0"
      ],
      "highlight": [
       7
      ]
     },
     {
      "caption": "Shift left again: 01011000 = 88. Shifting left 2 places multiplies by 4.",
      "array": [
       "0",
       "1",
       "0",
       "1",
       "1",
       "0",
       "0",
       "0"
      ],
      "highlight": [
       6,
       7
      ]
     },
     {
      "caption": "Logical right shift by 1: bits move right, a 0 fills the left. 00101100 = 44 (halved).",
      "array": [
       "0",
       "0",
       "1",
       "0",
       "1",
       "1",
       "0",
       "0"
      ],
      "highlight": [
       0
      ]
     }
    ]
   },
   {
    "kind": "stepper",
    "title": "Arithmetic right shift",
    "intro": "In two's complement, an arithmetic right shift copies the sign bit so negatives stay negative.",
    "frames": [
     {
      "caption": "Start: 11100100 = -28 (two's complement)",
      "array": [
       "1",
       "1",
       "1",
       "0",
       "0",
       "1",
       "0",
       "0"
      ]
     },
     {
      "caption": "Arithmetic right shift 1: the sign bit 1 is copied into the left. 11110010 = -14",
      "array": [
       "1",
       "1",
       "1",
       "1",
       "0",
       "0",
       "1",
       "0"
      ],
      "highlight": [
       0
      ]
     },
     {
      "caption": "Shift again: 11111001 = -7. Each right shift halves the value.",
      "array": [
       "1",
       "1",
       "1",
       "1",
       "1",
       "0",
       "0",
       "1"
      ],
      "highlight": [
       0,
       1
      ]
     }
    ]
   },
   {
    "kind": "check",
    "question": "Add `00011011` and `00000110`. Give the 8-bit answer.",
    "accept": [
     "00100001"
    ],
    "hints": [
     "27 + 6 = 33.",
     "33 = 32 + 1"
    ],
    "explain": "00011011 + 00000110 = 00100001 (33)."
   },
   {
    "kind": "check",
    "question": "A logical left shift of 3 places multiplies a number by...",
    "options": [
     "3",
     "6",
     "8",
     "9"
    ],
    "answer": 2,
    "hints": [
     "Each left shift doubles.",
     "2 x 2 x 2"
    ],
    "explain": "2^3 = 8 (if no 1s are lost)."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1a-1",
    "title": "Add",
    "prompt": "Add `01010101` and `00101010` (8-bit).",
    "accept": [
     "01111111"
    ],
    "hints": [
     "No column has two 1s.",
     "85 + 42 = 127"
    ],
    "solution": "01111111"
   },
   {
    "kind": "answer",
    "id": "p1a-2",
    "title": "Shift",
    "prompt": "Logical right shift `11001000` by 3 places.",
    "accept": [
     "00011001"
    ],
    "hints": [
     "Move every bit 3 places right, fill with 0s.",
     "200 / 8 = 25"
    ],
    "solution": "00011001"
   },
   {
    "kind": "answer",
    "id": "p1a-3",
    "title": "Overflow?",
    "prompt": "Does 11111111 + 00000001 overflow in 8-bit unsigned binary? Answer yes or no.",
    "accept": [
     "yes",
     "y"
    ],
    "hints": [
     "255 + 1 = ?",
     "Can 256 fit in 8 bits?"
    ],
    "solution": "Yes - 256 needs 9 bits, so the result 00000000 is wrong."
   }
  ],
  "quiz": [
   {
    "q": "1 + 1 in binary is:",
    "options": [
     "2",
     "11",
     "10",
     "01"
    ],
    "answer": 2,
    "explain": "0 carry 1."
   },
   {
    "q": "What is overflow?",
    "options": [
     "A result too big for the bits available",
     "A negative number",
     "A shift left",
     "A rounding error"
    ],
    "answer": 0,
    "explain": "The carry out is lost."
   },
   {
    "q": "Logical left shift by 1 is the same as...",
    "options": [
     "Halving",
     "Doubling",
     "Adding 1",
     "Negating"
    ],
    "answer": 1,
    "explain": "Each place value doubles."
   },
   {
    "q": "Arithmetic right shift keeps...",
    "options": [
     "The LSB",
     "The sign bit",
     "The carry",
     "The overflow"
    ],
    "answer": 1,
    "explain": "It copies the sign bit."
   },
   {
    "q": "00000110 shifted left 2 places gives:",
    "options": [
     "00011000",
     "00000001",
     "00001100",
     "01100000"
    ],
    "answer": 0,
    "explain": "6 x 4 = 24."
   }
  ]
 },
 {
  "id": "p1-hex",
  "paper": "Paper 1",
  "spec": "3.1.5",
  "title": "Hexadecimal",
  "summary": "Why hex is used and how to convert between hexadecimal and binary.",
  "minutes": 20,
  "steps": [
   {
    "kind": "explain",
    "title": "Base 16",
    "body": "Hexadecimal uses 16 digits: **0-9** then **A=10, B=11, C=12, D=13, E=14, F=15**.\n\nOne hex digit = **4 bits (a nibble)**. So one byte = two hex digits.\n\n**Why programmers use hex:** shorter, easier to read and remember, fewer mistakes when copying, and easy to convert to binary. (The computer still stores binary.)"
   },
   {
    "kind": "explain",
    "title": "Converting",
    "body": "**Binary to hex:** split into nibbles, convert each.\n`1010 1111` = A F = **AF**\n\n**Hex to binary:** each digit becomes 4 bits.\n`3E` = 0011 1110"
   },
   {
    "kind": "bits",
    "title": "Explore with hex",
    "intro": "Each group of 4 bits makes one hex digit. Make the hex value B7.",
    "mode": "unsigned",
    "bits": 8,
    "target": 183,
    "showHex": true
   },
   {
    "kind": "check",
    "question": "Convert `11000101` to hex.",
    "accept": [
     "C5"
    ],
    "hints": [
     "Split into 1100 and 0101.",
     "1100 = 12 = C"
    ],
    "explain": "1100 = C, 0101 = 5, so C5."
   },
   {
    "kind": "check",
    "question": "Convert hex `9F` to 8-bit binary.",
    "accept": [
     "10011111"
    ],
    "hints": [
     "9 = 1001",
     "F = 15 = 1111"
    ],
    "explain": "10011111"
   },
   {
    "kind": "check",
    "question": "Which is NOT a reason for using hexadecimal?",
    "options": [
     "Easier to read",
     "Fewer errors copying",
     "Computers store data in hex",
     "Shorter than binary"
    ],
    "answer": 2,
    "hints": [
     "Think about what the computer actually stores.",
     "Hardware only uses binary."
    ],
    "explain": "Computers store binary; hex is just for people."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1h-1",
    "title": "Hex to binary",
    "prompt": "Convert hex `3E` to binary (8 bits).",
    "accept": [
     "00111110"
    ],
    "hints": [
     "3 = 0011",
     "E = 14 = 1110"
    ],
    "solution": "00111110"
   },
   {
    "kind": "answer",
    "id": "p1h-2",
    "title": "Binary to hex",
    "prompt": "Convert `01111010` to hex.",
    "accept": [
     "7A"
    ],
    "hints": [
     "0111 = 7",
     "1010 = 10 = A"
    ],
    "solution": "7A"
   },
   {
    "kind": "answer",
    "id": "p1h-3",
    "title": "Colour codes",
    "prompt": "The colour #FF8000 has a green value of 80 (hex). What is that in denary?",
    "accept": [
     "128"
    ],
    "hints": [
     "8 x 16 + 0",
     "Or: 10000000 in binary"
    ],
    "solution": "8 x 16 = 128"
   }
  ],
  "quiz": [
   {
    "q": "What is hex F in denary?",
    "options": [
     "14",
     "15",
     "16",
     "10"
    ],
    "answer": 1,
    "explain": "F = 15."
   },
   {
    "q": "How many bits does one hex digit represent?",
    "options": [
     "2",
     "4",
     "8",
     "16"
    ],
    "answer": 1,
    "explain": "A nibble."
   },
   {
    "q": "What is 10101011 in hex?",
    "options": [
     "AB",
     "BA",
     "A11",
     "171"
    ],
    "answer": 0,
    "explain": "1010 = A, 1011 = B."
   },
   {
    "q": "What is hex 2C in binary?",
    "options": [
     "00101100",
     "00101101",
     "00011100",
     "11000010"
    ],
    "answer": 0,
    "explain": "2 = 0010, C = 1100."
   },
   {
    "q": "Why do programmers use hex?",
    "options": [
     "Computers need it",
     "It is easier to read than binary",
     "It uses less memory",
     "It is more accurate"
    ],
    "answer": 1,
    "explain": "Easier for humans."
   }
  ]
 },
 {
  "id": "p1-data-storage",
  "paper": "Paper 1",
  "spec": "Topic 3",
  "title": "Data storage, file sizes and compression",
  "summary": "Units of storage, calculating image and sound file sizes, and lossy vs lossless compression.",
  "minutes": 30,
  "steps": [
   {
    "kind": "explain",
    "title": "Units",
    "body": "- 1 **nibble** = 4 bits, 1 **byte** = 8 bits\n- **IEC (binary) prefixes**: 1 kibibyte (KiB) = 1024 bytes, 1 mebibyte (MiB) = 1024 KiB, 1 gibibyte (GiB) = 1024 MiB, 1 tebibyte (TiB) = 1024 GiB\n- To go up a unit divide by 1024; to go down multiply by 1024."
   },
   {
    "kind": "explain",
    "title": "Images",
    "body": "A bitmap image is a grid of **pixels**. Each pixel's colour is stored in binary.\n\n- **Colour depth** = bits per pixel. 1 bit = 2 colours, 8 bits = 256 colours, 24 bits = 16.7 million.\n- **Resolution** = width x height in pixels.\n\n**File size (bits) = width x height x colour depth.** Divide by 8 for bytes."
   },
   {
    "kind": "calc",
    "title": "Image size calculator",
    "intro": "Change the values to see how resolution and colour depth affect the file size.",
    "calc": "image"
   },
   {
    "kind": "explain",
    "title": "Sound",
    "body": "Sound is **sampled**: the amplitude is measured many times a second.\n\n- **Sample rate** (Hz) - samples per second\n- **Bit depth** - bits per sample\n- **Duration** in seconds, and number of **channels** (stereo = 2)\n\n**File size (bits) = sample rate x bit depth x seconds x channels.**"
   },
   {
    "kind": "calc",
    "title": "Sound size calculator",
    "intro": "See how sample rate and bit depth change the size of a recording.",
    "calc": "sound"
   },
   {
    "kind": "explain",
    "title": "Compression",
    "body": "**Compression** makes files smaller so they use less storage and transfer faster.\n\n- **Lossless** - no data is lost; the original can be rebuilt exactly (e.g. run-length encoding). Needed for text and programs.\n- **Lossy** - some data is permanently removed (e.g. detail people won't notice). Much smaller files; used for photos, music and video.\n\n**Run-length encoding**: `AAAABBB` becomes `4A3B`."
   },
   {
    "kind": "check",
    "question": "An image is 100 x 50 pixels with a colour depth of 8 bits. What is its size in bytes?",
    "accept": [
     "5000"
    ],
    "hints": [
     "Bits = 100 x 50 x 8 = 40000.",
     "Divide by 8 for bytes."
    ],
    "explain": "40000 bits / 8 = 5000 bytes."
   },
   {
    "kind": "check",
    "question": "Which compression should be used for a program file?",
    "options": [
     "Lossy",
     "Lossless"
    ],
    "answer": 1,
    "hints": [
     "Can a program lose any data and still run?",
     "Every bit matters."
    ],
    "explain": "Lossless - losing data would break the program."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1d-1",
    "title": "Kibibytes",
    "prompt": "How many bytes are in 2 KiB?",
    "accept": [
     "2048"
    ],
    "hints": [
     "1 KiB = 1024 bytes."
    ],
    "solution": "2 x 1024 = 2048"
   },
   {
    "kind": "answer",
    "id": "p1d-2",
    "title": "Colour depth",
    "prompt": "How many colours can a colour depth of 4 bits represent?",
    "accept": [
     "16"
    ],
    "hints": [
     "2 to the power of the colour depth."
    ],
    "solution": "2^4 = 16"
   },
   {
    "kind": "answer",
    "id": "p1d-3",
    "title": "Sound file",
    "prompt": "A 10-second mono recording uses 1000 samples per second and 8 bits per sample. What is the size in bytes?",
    "accept": [
     "10000"
    ],
    "hints": [
     "Bits = 1000 x 8 x 10 x 1",
     "Divide by 8"
    ],
    "solution": "80000 bits / 8 = 10000 bytes"
   }
  ],
  "quiz": [
   {
    "q": "How many bytes are in 1 KiB?",
    "options": [
     "1000",
     "1024",
     "8",
     "512"
    ],
    "answer": 1,
    "explain": "IEC prefix: 1024."
   },
   {
    "q": "What does colour depth mean?",
    "options": [
     "Number of pixels",
     "Bits per pixel",
     "Image width",
     "Bits per second"
    ],
    "answer": 1,
    "explain": "Bits used for each pixel's colour."
   },
   {
    "q": "Increasing the sample rate will...",
    "options": [
     "Reduce file size",
     "Increase file size and quality",
     "Lower quality",
     "Have no effect"
    ],
    "answer": 1,
    "explain": "More samples = more data."
   },
   {
    "q": "Lossy compression...",
    "options": [
     "Keeps all data",
     "Permanently removes some data",
     "Only works on text",
     "Makes files bigger"
    ],
    "answer": 1,
    "explain": "Removed data cannot be recovered."
   },
   {
    "q": "RLE of 'WWWWBBW' is:",
    "options": [
     "4W2B1W",
     "W4B2W1",
     "4W3B",
     "WBW"
    ],
    "answer": 0,
    "explain": "Count each run."
   }
  ]
 },
 {
  "id": "p1-logic",
  "paper": "Paper 1",
  "spec": "Logic",
  "title": "Logic gates and truth tables",
  "summary": "AND, OR and NOT gates, truth tables, and combining gates into logic expressions.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Logic gates",
    "body": "Logic gates take binary inputs (0 or 1) and give one output.\n\n- **AND** - output 1 only if **both** inputs are 1\n- **OR** - output 1 if **either** input (or both) is 1\n- **NOT** - one input; the output is the opposite\n\nA **truth table** lists every combination of inputs. With 2 inputs there are 4 rows; with 3 inputs there are 8."
   },
   {
    "kind": "gates",
    "title": "AND gate",
    "intro": "Click A and B to switch them on and off. When does the output light up?",
    "gate": "AND"
   },
   {
    "kind": "gates",
    "title": "OR gate",
    "intro": "Now try the OR gate.",
    "gate": "OR"
   },
   {
    "kind": "gates",
    "title": "NOT gate",
    "intro": "NOT has one input.",
    "gate": "NOT"
   },
   {
    "kind": "check",
    "question": "A = 1, B = 0. What is A AND B?",
    "options": [
     "0",
     "1"
    ],
    "answer": 0,
    "hints": [
     "AND needs both inputs to be 1.",
     "B is 0."
    ],
    "explain": "Both must be 1, so the output is 0."
   },
   {
    "kind": "gates",
    "title": "Combine gates: (A AND B) OR NOT C",
    "intro": "A logic expression combines gates. Find inputs that make the output 1.",
    "gate": "EXPR1"
   },
   {
    "kind": "check",
    "question": "How many rows does a truth table with 3 inputs have?",
    "accept": [
     "8"
    ],
    "hints": [
     "2 to the power of the number of inputs.",
     "2^3"
    ],
    "explain": "2^3 = 8 rows."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1l-1",
    "title": "OR gate",
    "prompt": "A = 0, B = 0. What is A OR B?",
    "accept": [
     "0"
    ],
    "hints": [
     "OR is 1 if at least one input is 1."
    ],
    "solution": "0 - neither input is 1."
   },
   {
    "kind": "answer",
    "id": "p1l-2",
    "title": "Expression",
    "prompt": "A = 1, B = 1. What is NOT (A AND B)?",
    "accept": [
     "0"
    ],
    "hints": [
     "Work out the bracket first: 1 AND 1 = 1.",
     "Then NOT 1."
    ],
    "solution": "NOT 1 = 0"
   },
   {
    "kind": "answer",
    "id": "p1l-3",
    "title": "Expression 2",
    "prompt": "A = 0, B = 1, C = 0. What is (A OR B) AND C?",
    "accept": [
     "0"
    ],
    "hints": [
     "A OR B = 1.",
     "1 AND 0"
    ],
    "solution": "1 AND 0 = 0"
   }
  ],
  "quiz": [
   {
    "q": "Which gate outputs 1 only when both inputs are 1?",
    "options": [
     "OR",
     "AND",
     "NOT",
     "XOR"
    ],
    "answer": 1,
    "explain": "AND."
   },
   {
    "q": "NOT 0 =",
    "options": [
     "0",
     "1"
    ],
    "answer": 1,
    "explain": "NOT reverses."
   },
   {
    "q": "1 OR 0 =",
    "options": [
     "0",
     "1"
    ],
    "answer": 1,
    "explain": "At least one input is 1."
   },
   {
    "q": "How many rows for 2 inputs?",
    "options": [
     "2",
     "3",
     "4",
     "8"
    ],
    "answer": 2,
    "explain": "2^2 = 4."
   },
   {
    "q": "A=1, B=0, C=1. (A AND B) OR C =",
    "options": [
     "0",
     "1"
    ],
    "answer": 1,
    "explain": "(1 AND 0) = 0; 0 OR 1 = 1."
   }
  ]
 },
 {
  "id": "p1-search-sort",
  "paper": "Paper 1",
  "spec": "Topic 1",
  "title": "Searching and sorting algorithms",
  "summary": "Linear and binary search, bubble sort and merge sort - see each step.",
  "minutes": 35,
  "steps": [
   {
    "kind": "explain",
    "title": "Searching",
    "body": "- **Linear search** checks each item in turn from the start. Works on **any** list, but slow for big lists.\n- **Binary search** needs a **sorted** list. It checks the middle item and throws away half the list each time - much faster for large lists."
   },
   {
    "kind": "stepper",
    "title": "Linear search",
    "intro": "Search for 23 in the list.",
    "frames": [
     {
      "caption": "Linear search for 23: check each item in turn from the start.",
      "array": [
       15,
       8,
       42,
       23,
       4,
       16
      ]
     },
     {
      "caption": "Index 0: 15 is not 23. Move on.",
      "array": [
       15,
       8,
       42,
       23,
       4,
       16
      ],
      "highlight": [
       0
      ]
     },
     {
      "caption": "Index 1: 8 is not 23. Move on.",
      "array": [
       15,
       8,
       42,
       23,
       4,
       16
      ],
      "highlight": [
       1
      ]
     },
     {
      "caption": "Index 2: 42 is not 23. Move on.",
      "array": [
       15,
       8,
       42,
       23,
       4,
       16
      ],
      "highlight": [
       2
      ]
     },
     {
      "caption": "Index 3: 23 = 23. Found it after 4 comparisons.",
      "array": [
       15,
       8,
       42,
       23,
       4,
       16
      ],
      "highlight": [
       3
      ],
      "done": [
       3
      ]
     }
    ]
   },
   {
    "kind": "stepper",
    "title": "Binary search",
    "intro": "Search for 23 in a sorted list. Watch low, mid and high.",
    "frames": [
     {
      "caption": "Binary search for 23. The list MUST be sorted. low = 0, high = 7.",
      "array": [
       4,
       8,
       15,
       16,
       23,
       42,
       50,
       61
      ],
      "pointers": {
       "low": 0,
       "high": 7
      }
     },
     {
      "caption": "mid = 3. 16 < 23, so discard the left half: low = 4.",
      "array": [
       4,
       8,
       15,
       16,
       23,
       42,
       50,
       61
      ],
      "highlight": [
       3
      ],
      "dim": [
       0,
       1,
       2,
       3
      ],
      "pointers": {
       "low": 0,
       "mid": 3,
       "high": 7
      }
     },
     {
      "caption": "mid = 5. 42 > 23, so discard the right half: high = 4.",
      "array": [
       4,
       8,
       15,
       16,
       23,
       42,
       50,
       61
      ],
      "highlight": [
       5
      ],
      "dim": [
       5,
       6,
       7
      ],
      "pointers": {
       "low": 4,
       "mid": 5,
       "high": 7
      }
     },
     {
      "caption": "mid = (4 + 4) // 2 = 4. a[4] = 23 - found!",
      "array": [
       4,
       8,
       15,
       16,
       23,
       42,
       50,
       61
      ],
      "highlight": [
       4
      ],
      "done": [
       4
      ],
      "pointers": {
       "low": 4,
       "mid": 4,
       "high": 4
      }
     }
    ]
   },
   {
    "kind": "check",
    "question": "Binary search can only be used when...",
    "options": [
     "the list is short",
     "the list is sorted",
     "the items are numbers",
     "the item is in the list"
    ],
    "answer": 1,
    "hints": [
     "It relies on comparing with the middle.",
     "Halves can only be discarded if the order is known."
    ],
    "explain": "The list must be sorted."
   },
   {
    "kind": "explain",
    "title": "Bubble sort",
    "body": "Go through the list comparing **adjacent** pairs and swap them if they are in the wrong order. After each **pass**, the largest remaining item has 'bubbled' to its final place. Stop when a pass makes no swaps.\n\nSimple but slow for large lists."
   },
   {
    "kind": "stepper",
    "title": "Bubble sort",
    "intro": "Watch each comparison and swap.",
    "frames": [
     {
      "caption": "Start: the unsorted list.",
      "array": [
       5,
       1,
       4,
       2,
       8
      ]
     },
     {
      "caption": "Pass 1: compare 5 and 1 - out of order, so swap.",
      "array": [
       5,
       1,
       4,
       2,
       8
      ],
      "highlight": [
       0,
       1
      ],
      "done": []
     },
     {
      "caption": "Swapped.",
      "array": [
       1,
       5,
       4,
       2,
       8
      ],
      "highlight": [
       0,
       1
      ],
      "done": []
     },
     {
      "caption": "Pass 1: compare 5 and 4 - out of order, so swap.",
      "array": [
       1,
       5,
       4,
       2,
       8
      ],
      "highlight": [
       1,
       2
      ],
      "done": []
     },
     {
      "caption": "Swapped.",
      "array": [
       1,
       4,
       5,
       2,
       8
      ],
      "highlight": [
       1,
       2
      ],
      "done": []
     },
     {
      "caption": "Pass 1: compare 5 and 2 - out of order, so swap.",
      "array": [
       1,
       4,
       5,
       2,
       8
      ],
      "highlight": [
       2,
       3
      ],
      "done": []
     },
     {
      "caption": "Swapped.",
      "array": [
       1,
       4,
       2,
       5,
       8
      ],
      "highlight": [
       2,
       3
      ],
      "done": []
     },
     {
      "caption": "Pass 1: compare 5 and 8 - already in order, no swap.",
      "array": [
       1,
       4,
       2,
       5,
       8
      ],
      "highlight": [
       3,
       4
      ],
      "done": []
     },
     {
      "caption": "End of pass 1: 8 is now in its final place.",
      "array": [
       1,
       4,
       2,
       5,
       8
      ],
      "done": [
       4
      ]
     },
     {
      "caption": "Pass 2: compare 1 and 4 - already in order, no swap.",
      "array": [
       1,
       4,
       2,
       5,
       8
      ],
      "highlight": [
       0,
       1
      ],
      "done": [
       4
      ]
     },
     {
      "caption": "Pass 2: compare 4 and 2 - out of order, so swap.",
      "array": [
       1,
       4,
       2,
       5,
       8
      ],
      "highlight": [
       1,
       2
      ],
      "done": [
       4
      ]
     },
     {
      "caption": "Swapped.",
      "array": [
       1,
       2,
       4,
       5,
       8
      ],
      "highlight": [
       1,
       2
      ],
      "done": [
       4
      ]
     },
     {
      "caption": "Pass 2: compare 4 and 5 - already in order, no swap.",
      "array": [
       1,
       2,
       4,
       5,
       8
      ],
      "highlight": [
       2,
       3
      ],
      "done": [
       4
      ]
     },
     {
      "caption": "End of pass 2: 5 is now in its final place.",
      "array": [
       1,
       2,
       4,
       5,
       8
      ],
      "done": [
       3,
       4
      ]
     },
     {
      "caption": "Pass 3: compare 1 and 2 - already in order, no swap.",
      "array": [
       1,
       2,
       4,
       5,
       8
      ],
      "highlight": [
       0,
       1
      ],
      "done": [
       3,
       4
      ]
     },
     {
      "caption": "Pass 3: compare 2 and 4 - already in order, no swap.",
      "array": [
       1,
       2,
       4,
       5,
       8
      ],
      "highlight": [
       1,
       2
      ],
      "done": [
       3,
       4
      ]
     },
     {
      "caption": "End of pass 3: 4 is now in its final place. No swaps in this pass, so the list is sorted.",
      "array": [
       1,
       2,
       4,
       5,
       8
      ],
      "done": [
       2,
       3,
       4
      ]
     },
     {
      "caption": "Sorted!",
      "array": [
       1,
       2,
       4,
       5,
       8
      ],
      "done": [
       0,
       1,
       2,
       3,
       4
      ]
     }
    ]
   },
   {
    "kind": "stepper",
    "title": "Merge sort",
    "intro": "Divide the list into single items, then merge pairs back together in order.",
    "frames": [
     {
      "caption": "Merge sort: first split the list in half again and again until each part has one item.",
      "groups": [
       [
        38,
        27,
        43,
        3,
        9,
        82,
        10,
        1
       ]
      ]
     },
     {
      "caption": "Split.",
      "groups": [
       [
        38,
        27,
        43,
        3
       ],
       [
        9,
        82,
        10,
        1
       ]
      ]
     },
     {
      "caption": "Split.",
      "groups": [
       [
        38,
        27
       ],
       [
        43,
        3
       ],
       [
        9,
        82
       ],
       [
        10,
        1
       ]
      ]
     },
     {
      "caption": "Split.",
      "groups": [
       [
        38
       ],
       [
        27
       ],
       [
        43
       ],
       [
        3
       ],
       [
        9
       ],
       [
        82
       ],
       [
        10
       ],
       [
        1
       ]
      ]
     },
     {
      "caption": "Merge pairs of groups, putting the items in order as you merge.",
      "groups": [
       [
        27,
        38
       ],
       [
        3,
        43
       ],
       [
        9,
        82
       ],
       [
        1,
        10
       ]
      ]
     },
     {
      "caption": "Merge pairs of groups, putting the items in order as you merge.",
      "groups": [
       [
        3,
        27,
        38,
        43
       ],
       [
        1,
        9,
        10,
        82
       ]
      ]
     },
     {
      "caption": "Merge pairs of groups, putting the items in order as you merge.",
      "groups": [
       [
        1,
        3,
        9,
        10,
        27,
        38,
        43,
        82
       ]
      ]
     },
     {
      "caption": "One sorted list.",
      "groups": [
       [
        1,
        3,
        9,
        10,
        27,
        38,
        43,
        82
       ]
      ]
     }
    ]
   },
   {
    "kind": "check",
    "question": "After the first pass of a bubble sort (ascending), which item is guaranteed to be in its final place?",
    "options": [
     "The smallest",
     "The largest",
     "The middle",
     "None"
    ],
    "answer": 1,
    "hints": [
     "Think about where the biggest item ends up.",
     "It gets swapped right every time it is compared."
    ],
    "explain": "The largest item bubbles to the end."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1ss-1",
    "title": "Binary search steps",
    "prompt": "List: 2, 5, 9, 14, 20, 31, 40. Using binary search for 31, which item is checked FIRST (middle)?",
    "accept": [
     "14"
    ],
    "hints": [
     "There are 7 items, indexes 0-6.",
     "mid = (0 + 6) // 2 = 3"
    ],
    "solution": "Index 3 is 14."
   },
   {
    "kind": "answer",
    "id": "p1ss-2",
    "title": "Bubble sort pass",
    "prompt": "Give the list 4, 3, 1, 5 after ONE pass of bubble sort (ascending), as numbers separated by commas.",
    "accept": [
     "3,1,4,5",
     "3, 1, 4, 5"
    ],
    "hints": [
     "Compare 4,3 - swap. Then 4,1 - swap. Then 4,5 - no swap."
    ],
    "solution": "3, 1, 4, 5"
   },
   {
    "kind": "code",
    "id": "p1ss-3",
    "title": "Code a linear search",
    "prompt": "Search `names` for the name typed (`Name: `). Print `Found at index ` and the index, or `Not found`.",
    "starter": "names = [\"Ali\", \"Bo\", \"Cy\", \"Di\", \"Ed\"]\n",
    "solution": "names = [\"Ali\", \"Bo\", \"Cy\", \"Di\", \"Ed\"]\ntarget = input(\"Name: \")\nfound = -1\nfor i in range(len(names)):\n    if names[i] == target:\n        found = i\nif found == -1:\n    print(\"Not found\")\nelse:\n    print(\"Found at index\", found)\n",
    "tests": [
     {
      "inputs": [
       "Cy"
      ],
      "expected": "Found at index 2\n"
     },
     {
      "inputs": [
       "Zed"
      ],
      "expected": "Not found\n"
     },
     {
      "inputs": [
       "Ali"
      ],
      "expected": "Found at index 0\n"
     }
    ],
    "hints": [
     "Loop through the indexes and compare.",
     "Use found = -1 to mean 'not found yet'."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "Which search works on an unsorted list?",
    "options": [
     "Binary",
     "Linear",
     "Both",
     "Neither"
    ],
    "answer": 1,
    "explain": "Binary needs sorted data."
   },
   {
    "q": "Binary search on 8 items: maximum comparisons?",
    "options": [
     "3",
     "4",
     "8",
     "2"
    ],
    "answer": 1,
    "explain": "8 -> 4 -> 2 -> 1: up to 4 checks."
   },
   {
    "q": "Bubble sort compares...",
    "options": [
     "the first and last items",
     "adjacent pairs",
     "random pairs",
     "the middle item"
    ],
    "answer": 1,
    "explain": "Neighbouring items."
   },
   {
    "q": "Merge sort first...",
    "options": [
     "swaps adjacent items",
     "splits the list into single items",
     "finds the middle",
     "reverses the list"
    ],
    "answer": 1,
    "explain": "Divide, then merge."
   },
   {
    "q": "When does bubble sort stop?",
    "options": [
     "After one pass",
     "When a pass makes no swaps",
     "When the first item is smallest",
     "Never"
    ],
    "answer": 1,
    "explain": "No swaps = sorted."
   }
  ]
 },
 {
  "id": "p1-algorithms-trace",
  "paper": "Paper 1",
  "spec": "Topic 1",
  "title": "Algorithms, flowcharts and trace tables",
  "summary": "Decomposition and abstraction, flowchart symbols, pseudocode and dry-running with trace tables.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Computational thinking",
    "body": "- **Decomposition** - break a problem into smaller parts that are easier to solve\n- **Abstraction** - remove unnecessary detail and focus on what matters\n- An **algorithm** is a precise sequence of steps to solve a problem. It can be shown as a **flowchart**, **pseudocode** or program code."
   },
   {
    "kind": "explain",
    "title": "Flowchart symbols",
    "body": "- **Terminator** (rounded box) - Start / Stop\n- **Process** (rectangle) - a calculation or assignment\n- **Decision** (diamond) - a Yes/No question, two exits\n- **Input/Output** (parallelogram) - read or display data\n- **Arrows** show the flow"
   },
   {
    "kind": "trace",
    "title": "A trace table follows every variable",
    "intro": "Dry-run this loop. A trace table has a column for each variable and the output - just like the variables panel here.",
    "code": "total = 0\ncount = 1\nwhile count <= 4:\n    total = total + count\n    count = count + 2\nprint(total)\n",
    "inputs": [],
    "notes": {
     "3": "Check the condition each time: is count <= 4?",
     "5": "count goes 1, 3, 5 - when it is 5 the loop stops."
    },
    "predict": {
     "question": "What is printed?",
     "options": [
      "4",
      "10",
      "6",
      "9"
     ],
     "answer": 0
    },
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "total": "0"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "0",
       "count": "1"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "total": "0",
       "count": "1"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "total": "1",
       "count": "1"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "1",
       "count": "3"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "total": "1",
       "count": "3"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "total": "4",
       "count": "3"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "4",
       "count": "5"
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "total": "4",
       "count": "5"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "total": "4",
       "count": "5"
      },
      "out": "4\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "Which flowchart symbol is used for a decision?",
    "options": [
     "Rectangle",
     "Diamond",
     "Parallelogram",
     "Oval"
    ],
    "answer": 1,
    "hints": [
     "It has a Yes and a No exit.",
     "A diamond shape."
    ],
    "explain": "Decisions are diamonds."
   },
   {
    "kind": "check",
    "question": "Complete: after line 4 runs the second time, what is total?",
    "accept": [
     "4"
    ],
    "hints": [
     "First time total = 0 + 1.",
     "Second time count is 3."
    ],
    "explain": "total = 1 + 3 = 4.",
    "code": "total = 0\ncount = 1\nwhile count <= 4:\n    total = total + count\n    count = count + 2"
   },
   {
    "kind": "check",
    "question": "Removing unnecessary detail from a problem is called...",
    "options": [
     "Decomposition",
     "Abstraction",
     "Iteration",
     "Selection"
    ],
    "answer": 1,
    "hints": [
     "Focus on what matters.",
     "A map of the London Underground is a famous example."
    ],
    "explain": "Abstraction."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1at-1",
    "title": "Trace it",
    "prompt": "x = 2. The loop `for i in range(3): x = x * 2` runs. What is x at the end?",
    "accept": [
     "16"
    ],
    "hints": [
     "2, then 4, 8, 16.",
     "The loop runs 3 times."
    ],
    "solution": "2 x 2 x 2 x 2 = 16"
   },
   {
    "kind": "answer",
    "id": "p1at-2",
    "title": "Symbols",
    "prompt": "Which flowchart symbol is used for input and output? (one word)",
    "accept": [
     "parallelogram"
    ],
    "hints": [
     "It is a slanted rectangle."
    ],
    "solution": "Parallelogram"
   }
  ],
  "quiz": [
   {
    "q": "Breaking a problem into smaller parts is:",
    "options": [
     "Abstraction",
     "Decomposition",
     "Iteration",
     "Debugging"
    ],
    "answer": 1,
    "explain": "Decomposition."
   },
   {
    "q": "A trace table is used to...",
    "options": [
     "Draw flowcharts",
     "Dry-run an algorithm and track variables",
     "Store data",
     "Compile code"
    ],
    "answer": 1,
    "explain": "Follow values step by step."
   },
   {
    "q": "Start and Stop use which symbol?",
    "options": [
     "Diamond",
     "Terminator (rounded)",
     "Rectangle",
     "Arrow"
    ],
    "answer": 1,
    "explain": "Terminator."
   },
   {
    "q": "What is printed?",
    "options": [
     "5",
     "6",
     "4",
     "3"
    ],
    "answer": 0,
    "explain": "n goes 1, 3, 5 - stops when 5 > 4.",
    "code": "n = 1\nwhile n <= 4:\n    n = n + 2\nprint(n)"
   },
   {
    "q": "An algorithm is...",
    "options": [
     "A programming language",
     "A precise set of steps to solve a problem",
     "A type of computer",
     "A flowchart symbol"
    ],
    "answer": 1,
    "explain": "Algorithms can be written in many ways."
   }
  ]
 },
 {
  "id": "p1-cpu",
  "paper": "Paper 1",
  "spec": "Topic 4",
  "title": "The CPU and the fetch-decode-execute cycle",
  "summary": "Von Neumann architecture, CPU components and registers, and how instructions are processed.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Von Neumann architecture",
    "body": "Programs **and** data are stored together in the same **main memory (RAM)**. The CPU fetches instructions from memory one at a time.\n\nInside the CPU:\n- **Control unit (CU)** - decodes instructions and controls the other parts\n- **Arithmetic logic unit (ALU)** - calculations and logic comparisons\n- **Registers** - tiny, very fast storage inside the CPU\n- **Clock** - sends pulses that set the speed (clock speed, e.g. 3 GHz)\n\nBuses (address, data, control) connect the CPU to memory."
   },
   {
    "kind": "stepper",
    "title": "Fetch-decode-execute",
    "intro": "Step through one instruction: ADD the value at address 6 to the accumulator.",
    "frames": [
     {
      "caption": "FETCH 1: The program counter (PC) holds the address of the next instruction: 3. It is copied to the MAR.",
      "table": [
       [
        "PC",
        "3"
       ],
       [
        "MAR",
        "3"
       ],
       [
        "MDR",
        ""
       ],
       [
        "CIR",
        ""
       ],
       [
        "ACC",
        "10"
       ]
      ]
     },
     {
      "caption": "FETCH 2: The instruction at address 3 travels along the data bus into the MDR. The PC goes up by 1, ready for next time.",
      "table": [
       [
        "PC",
        "4"
       ],
       [
        "MAR",
        "3"
       ],
       [
        "MDR",
        "ADD 6"
       ],
       [
        "CIR",
        ""
       ],
       [
        "ACC",
        "10"
       ]
      ]
     },
     {
      "caption": "FETCH 3: The instruction is copied into the current instruction register (CIR).",
      "table": [
       [
        "PC",
        "4"
       ],
       [
        "MAR",
        "3"
       ],
       [
        "MDR",
        "ADD 6"
       ],
       [
        "CIR",
        "ADD 6"
       ],
       [
        "ACC",
        "10"
       ]
      ]
     },
     {
      "caption": "DECODE: The control unit works out what ADD 6 means: add the value stored at address 6 to the accumulator.",
      "table": [
       [
        "PC",
        "4"
       ],
       [
        "MAR",
        "3"
       ],
       [
        "MDR",
        "ADD 6"
       ],
       [
        "CIR",
        "ADD 6"
       ],
       [
        "ACC",
        "10"
       ]
      ]
     },
     {
      "caption": "EXECUTE: The address 6 is copied to the MAR, the value stored there (5) comes into the MDR, and the ALU adds it to the accumulator: 10 + 5 = 15.",
      "table": [
       [
        "PC",
        "4"
       ],
       [
        "MAR",
        "6"
       ],
       [
        "MDR",
        "5"
       ],
       [
        "CIR",
        "ADD 6"
       ],
       [
        "ACC",
        "15"
       ]
      ]
     }
    ]
   },
   {
    "kind": "check",
    "question": "Which register holds the address of the next instruction?",
    "options": [
     "MAR",
     "MDR",
     "Program counter",
     "Accumulator"
    ],
    "answer": 2,
    "hints": [
     "It counts through the program.",
     "PC"
    ],
    "explain": "The program counter."
   },
   {
    "kind": "check",
    "question": "Which part of the CPU does calculations?",
    "options": [
     "Control unit",
     "ALU",
     "Cache",
     "Clock"
    ],
    "answer": 1,
    "hints": [
     "Arithmetic ...",
     "Arithmetic logic unit"
    ],
    "explain": "The ALU."
   },
   {
    "kind": "explain",
    "title": "What affects performance?",
    "body": "- **Clock speed** - more cycles per second\n- **Number of cores** - more instructions processed at the same time\n- **Cache size** - very fast memory close to the CPU for frequently used data"
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1c-1",
    "title": "Registers",
    "prompt": "Which register holds the data that has just been fetched from memory? (3 letters)",
    "accept": [
     "MDR"
    ],
    "hints": [
     "Memory D... R..."
    ],
    "solution": "MDR - memory data register"
   },
   {
    "kind": "answer",
    "id": "p1c-2",
    "title": "Stored program",
    "prompt": "In the Von Neumann architecture, where are programs and data stored? (one word)",
    "accept": [
     "memory",
     "ram",
     "main memory"
    ],
    "hints": [
     "They share the same place."
    ],
    "solution": "In main memory (RAM)."
   }
  ],
  "quiz": [
   {
    "q": "What does the control unit do?",
    "options": [
     "Stores files",
     "Decodes instructions and controls components",
     "Does arithmetic",
     "Displays output"
    ],
    "answer": 1,
    "explain": "CU coordinates the CPU."
   },
   {
    "q": "Which register is sent the address to read from memory?",
    "options": [
     "MAR",
     "MDR",
     "CIR",
     "ACC"
    ],
    "answer": 0,
    "explain": "Memory address register."
   },
   {
    "q": "In which stage is the instruction worked out?",
    "options": [
     "Fetch",
     "Decode",
     "Execute",
     "Store"
    ],
    "answer": 1,
    "explain": "Decode."
   },
   {
    "q": "What is cache?",
    "options": [
     "Slow storage",
     "Small, fast memory near the CPU",
     "A register",
     "Secondary storage"
    ],
    "answer": 1,
    "explain": "Speeds up access to frequent data."
   },
   {
    "q": "In Von Neumann architecture, programs and data are...",
    "options": [
     "stored separately",
     "stored together in memory",
     "only on disk",
     "in the ALU"
    ],
    "answer": 1,
    "explain": "Stored program concept."
   }
  ]
 },
 {
  "id": "p1-networks",
  "paper": "Paper 1",
  "spec": "Topic 5",
  "title": "Networks and the TCP/IP model",
  "summary": "LANs and WANs, topologies, protocols and the 4-layer TCP/IP model.",
  "minutes": 30,
  "steps": [
   {
    "kind": "explain",
    "title": "Types of network",
    "body": "- **LAN** (local area network) - a small area such as a school; hardware owned by the organisation\n- **WAN** (wide area network) - a large geographical area; uses third-party links. The internet is the biggest WAN.\n\n**Topologies:**\n- **Bus** - all devices on one cable; cheap but collisions and one break stops everything\n- **Star** - each device connects to a central switch; reliable, but the switch is a single point of failure\n- **Mesh** - devices connect to many others; very reliable but expensive"
   },
   {
    "kind": "explain",
    "title": "Protocols",
    "body": "A **protocol** is a set of rules for communication.\n\n- **HTTP / HTTPS** - web pages (HTTPS is encrypted)\n- **FTP** - transferring files\n- **SMTP** - sending email; **POP3 / IMAP** - receiving email\n- **TCP** - splits data into packets, checks they arrive and reassembles them\n- **IP** - addresses and routes packets\n- **Ethernet / Wi-Fi** - sending data over a LAN"
   },
   {
    "kind": "stepper",
    "title": "The 4-layer TCP/IP model",
    "intro": "Follow a web page request down the layers on one computer and up the layers on the other.",
    "frames": [
     {
      "caption": "APPLICATION layer: the browser makes a request using HTTP(S).",
      "table": [
       [
        "Layer",
        "Application"
       ],
       [
        "Protocols",
        "HTTP, HTTPS, FTP, SMTP, IMAP"
       ],
       [
        "Job",
        "Provides network services to applications"
       ]
      ]
     },
     {
      "caption": "TRANSPORT layer: TCP splits the data into packets, numbers them and checks they all arrive.",
      "table": [
       [
        "Layer",
        "Transport"
       ],
       [
        "Protocols",
        "TCP, UDP"
       ],
       [
        "Job",
        "Packets, port numbers, error checking"
       ]
      ]
     },
     {
      "caption": "INTERNET layer: IP adds the source and destination IP addresses and routes packets between networks.",
      "table": [
       [
        "Layer",
        "Internet"
       ],
       [
        "Protocols",
        "IP"
       ],
       [
        "Job",
        "Addressing and routing"
       ]
      ]
     },
     {
      "caption": "LINK layer: the packets are sent as signals over the cable or Wi-Fi using MAC addresses.",
      "table": [
       [
        "Layer",
        "Link (network access)"
       ],
       [
        "Protocols",
        "Ethernet, Wi-Fi"
       ],
       [
        "Job",
        "Physical transmission"
       ]
      ]
     },
     {
      "caption": "At the destination the layers are reversed: link, internet, transport (TCP reassembles the packets), application.",
      "table": [
       [
        "Direction",
        "Up the layers"
       ],
       [
        "Result",
        "The web server receives the HTTP request"
       ]
      ]
     }
    ]
   },
   {
    "kind": "check",
    "question": "Which topology has every device connected to a central switch?",
    "options": [
     "Bus",
     "Star",
     "Mesh",
     "Ring"
    ],
    "answer": 1,
    "hints": [
     "Think of a shape with a centre.",
     "Like the spokes of a wheel."
    ],
    "explain": "Star."
   },
   {
    "kind": "check",
    "question": "Which protocol is used to send email?",
    "options": [
     "HTTP",
     "FTP",
     "SMTP",
     "IMAP"
    ],
    "answer": 2,
    "hints": [
     "S for ... send?",
     "Simple Mail Transfer Protocol"
    ],
    "explain": "SMTP sends; IMAP/POP3 receive."
   },
   {
    "kind": "check",
    "question": "Which TCP/IP layer adds IP addresses?",
    "options": [
     "Application",
     "Transport",
     "Internet",
     "Link"
    ],
    "answer": 2,
    "hints": [
     "IP = Internet Protocol.",
     "Its layer has the same name."
    ],
    "explain": "The internet layer."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1n-1",
    "title": "LAN or WAN?",
    "prompt": "A network connecting offices in London, Cairo and Dubai is a... (LAN or WAN)",
    "accept": [
     "wan"
    ],
    "hints": [
     "Large geographical area."
    ],
    "solution": "WAN"
   },
   {
    "kind": "answer",
    "id": "p1n-2",
    "title": "Layers",
    "prompt": "Which TCP/IP layer splits data into packets? (one word)",
    "accept": [
     "transport"
    ],
    "hints": [
     "TCP works at this layer."
    ],
    "solution": "Transport"
   }
  ],
  "quiz": [
   {
    "q": "What is a protocol?",
    "options": [
     "A cable",
     "A set of rules for communication",
     "A network device",
     "A web page"
    ],
    "answer": 1,
    "explain": "Rules."
   },
   {
    "q": "Which is a disadvantage of a bus topology?",
    "options": [
     "Expensive cabling",
     "A break in the main cable stops the network",
     "Needs a switch",
     "Too fast"
    ],
    "answer": 1,
    "explain": "Single cable."
   },
   {
    "q": "HTTPS is HTTP plus...",
    "options": [
     "File transfer",
     "Encryption",
     "Email",
     "Compression"
    ],
    "answer": 1,
    "explain": "Secure = encrypted."
   },
   {
    "q": "The top layer of the TCP/IP model is:",
    "options": [
     "Link",
     "Internet",
     "Transport",
     "Application"
    ],
    "answer": 3,
    "explain": "Application."
   },
   {
    "q": "The internet is an example of a...",
    "options": [
     "LAN",
     "WAN",
     "PAN",
     "Star"
    ],
    "answer": 1,
    "explain": "Largest WAN."
   }
  ]
 },
 {
  "id": "p1-security-ethics",
  "paper": "Paper 1",
  "spec": "Topics 5-6",
  "title": "Cyber security, ethics and the law",
  "summary": "Threats such as malware and phishing, ways to protect systems, and ethical/legal issues.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Threats",
    "body": "- **Malware** - malicious software: viruses, worms, trojans, ransomware, spyware\n- **Phishing** - fake emails or websites that trick people into giving personal details\n- **Social engineering** - manipulating people, e.g. pretending to be IT support\n- **Brute-force attack** - trying every possible password\n- **Denial of service (DoS)** - flooding a server so real users cannot access it\n- **Data interception** - capturing data as it travels across a network"
   },
   {
    "kind": "explain",
    "title": "Protection",
    "body": "- **Strong passwords** and **two-factor authentication**\n- **Firewall** - checks incoming and outgoing traffic against rules\n- **Anti-malware software** - scans for and removes malware\n- **Encryption** - data is unreadable without the key\n- **Updates / patches** - fix security weaknesses\n- **Access levels** and **user training** (e.g. spotting phishing)\n- **Backups** - restore data after an attack"
   },
   {
    "kind": "check",
    "question": "A fake email asks you to 'confirm your bank password'. This is...",
    "options": [
     "A DoS attack",
     "Phishing",
     "A brute-force attack",
     "A firewall"
    ],
    "answer": 1,
    "hints": [
     "It tries to trick you.",
     "It 'fishes' for details."
    ],
    "explain": "Phishing."
   },
   {
    "kind": "check",
    "question": "Which protection makes intercepted data unreadable?",
    "options": [
     "Firewall",
     "Encryption",
     "Backup",
     "Anti-malware"
    ],
    "answer": 1,
    "hints": [
     "Think about scrambling the data.",
     "Only someone with the key can read it."
    ],
    "explain": "Encryption."
   },
   {
    "kind": "explain",
    "title": "Ethics, law and the environment",
    "body": "- **Privacy** - personal data must be collected and stored responsibly (data protection laws)\n- **Copyright** and **licences** - open source vs proprietary software\n- **Environmental impact** - energy use of data centres, e-waste, mining of materials\n- **Artificial intelligence** - bias, accountability, jobs"
   },
   {
    "kind": "check",
    "question": "Software whose source code can be viewed and changed by anyone is...",
    "options": [
     "Proprietary",
     "Open source",
     "Malware",
     "Firmware"
    ],
    "answer": 1,
    "hints": [
     "The code is 'open'.",
     "Linux is an example."
    ],
    "explain": "Open source."
   }
  ],
  "practice": [
   {
    "kind": "answer",
    "id": "p1se-1",
    "title": "Name the threat",
    "prompt": "Trying every possible combination to guess a password is called a ... attack (two words).",
    "accept": [
     "brute force",
     "brute-force",
     "bruteforce"
    ],
    "hints": [
     "It uses force, not cleverness."
    ],
    "solution": "Brute-force attack"
   },
   {
    "kind": "answer",
    "id": "p1se-2",
    "title": "Protection",
    "prompt": "Name the security measure that checks network traffic against a set of rules (one word).",
    "accept": [
     "firewall"
    ],
    "hints": [
     "It is a 'wall' between networks."
    ],
    "solution": "Firewall"
   }
  ],
  "quiz": [
   {
    "q": "Ransomware...",
    "options": [
     "speeds up a computer",
     "encrypts files and demands payment",
     "is a firewall",
     "is a password"
    ],
    "answer": 1,
    "explain": "It holds data to ransom."
   },
   {
    "q": "Two-factor authentication means...",
    "options": [
     "two passwords",
     "a second way of proving identity",
     "two firewalls",
     "two users"
    ],
    "answer": 1,
    "explain": "e.g. a code sent to your phone."
   },
   {
    "q": "A DoS attack aims to...",
    "options": [
     "steal passwords",
     "make a service unavailable",
     "encrypt files",
     "send spam"
    ],
    "answer": 1,
    "explain": "Floods the server."
   },
   {
    "q": "Why install software updates?",
    "options": [
     "To get new colours",
     "To fix security vulnerabilities",
     "To slow the computer",
     "To remove the firewall"
    ],
    "answer": 1,
    "explain": "Patches close weaknesses."
   },
   {
    "q": "Which is an environmental issue of computing?",
    "options": [
     "Phishing",
     "E-waste",
     "Copyright",
     "Encryption"
    ],
    "answer": 1,
    "explain": "Disposal of old devices."
   }
  ]
 },
 {
  "id": "p2-variables-output",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Variables, data types and output",
  "summary": "Store values in variables, use the four data types and display results with print().",
  "minutes": 20,
  "steps": [
   {
    "kind": "explain",
    "title": "What is a variable?",
    "body": "A **variable** is a named storage location in memory. Its value can change while the program runs.\n\n- `score = 10` stores the integer 10 in a variable called `score`.\n- The `=` sign means **assign** (store), not \"is equal to\".\n- The value on the right is worked out first, then stored in the name on the left.",
    "code": "score = 10\nname = \"Ava\"\nscore = score + 5",
    "tip": "Read `score = score + 5` as: take the old score, add 5, store the answer back in score."
   },
   {
    "kind": "explain",
    "title": "Four data types",
    "body": "Every value has a **data type**:\n\n- **integer** (`int`) - whole numbers: `7`, `-3`\n- **real** (`float`) - numbers with a decimal point: `2.5`, `9.0`\n- **string** (`str`) - text in quotes: `\"Hello\"`, `\"42\"`\n- **Boolean** (`bool`) - `True` or `False`\n\n`\"42\"` is a string, not a number - you cannot do maths with it until you convert it."
   },
   {
    "kind": "trace",
    "title": "Watch the variables change",
    "intro": "Step through the program. The highlighted line is the one about to run.",
    "code": "score = 10\nbonus = 5\nscore = score + bonus\nname = \"Ava\"\nprint(name, \"scored\", score)\n",
    "inputs": [],
    "notes": {
     "1": "score is created and given the value 10.",
     "3": "The right side is worked out first: 10 + 5 = 15. Then 15 is stored in score.",
     "5": "print() shows its items separated by spaces."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "score": "10"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "score": "10",
       "bonus": "5"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "score": "15",
       "bonus": "5"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "score": "15",
       "bonus": "5",
       "name": "\"Ava\""
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "score": "15",
       "bonus": "5",
       "name": "\"Ava\""
      },
      "out": "Ava scored 15\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What is the data type of `3.0`?",
    "options": [
     "integer",
     "real (float)",
     "string",
     "Boolean"
    ],
    "answer": 1,
    "hints": [
     "Look for a decimal point.",
     "Any number with a decimal point is a real number, even if it ends in .0"
    ],
    "explain": "3.0 has a decimal point, so it is a real (float), not an integer."
   },
   {
    "kind": "trace",
    "title": "Predict the output",
    "intro": "Before stepping through, decide what this will print.",
    "code": "a = 4\nb = a\na = 9\nprint(a, b)\n",
    "inputs": [],
    "notes": {
     "2": "b gets a COPY of a's current value (4).",
     "3": "Changing a now does not change b."
    },
    "predict": {
     "question": "What will the program print?",
     "options": [
      "9 9",
      "4 9",
      "9 4",
      "4 4"
     ],
     "answer": 2
    },
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "a": "4"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "a": "4",
       "b": "4"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "a": "9",
       "b": "4"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "a": "9",
       "b": "4"
      },
      "out": "9 4\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "After these lines run, what is the value of `total`?",
    "accept": [
     "11"
    ],
    "hints": [
     "Work through one line at a time.",
     "total starts at 5, then becomes 5 + 6."
    ],
    "explain": "total = 5, then total = total + 6 = 11.",
    "code": "total = 5\ntotal = total + 6"
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2v-1",
    "title": "Introduce yourself",
    "prompt": "Create a variable `name` storing \"Sam\" and a variable `age` storing 15. Print exactly:\n`Sam is 15 years old`",
    "starter": "# Create your variables here\n",
    "solution": "name = \"Sam\"\nage = 15\nprint(name, \"is\", age, \"years old\")\n",
    "tests": [
     {
      "inputs": [],
      "expected": "Sam is 15 years old\n"
     }
    ],
    "hints": [
     "print() can take several items separated by commas.",
     "Try: print(name, \"is\", age, \"years old\")"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2v-2",
    "title": "Swap two values",
    "prompt": "`x` is 3 and `y` is 8. Swap them using a third variable `temp`, then print x and y on one line: `8 3`",
    "starter": "x = 3\ny = 8\n# Swap x and y using temp\n\nprint(x, y)\n",
    "solution": "x = 3\ny = 8\ntemp = x\nx = y\ny = temp\nprint(x, y)\n",
    "tests": [
     {
      "inputs": [],
      "expected": "8 3\n"
     }
    ],
    "hints": [
     "Store x in temp first, so you don't lose it.",
     "temp = x, then x = y, then y = temp."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "Which symbol assigns a value to a variable in Python?",
    "options": [
     "==",
     "=",
     "=>",
     ":"
    ],
    "answer": 1,
    "explain": "= assigns. == compares two values."
   },
   {
    "q": "Which value is a Boolean?",
    "options": [
     "\"True\"",
     "1.0",
     "False",
     "'no'"
    ],
    "answer": 2,
    "explain": "Booleans are True or False without quotes."
   },
   {
    "q": "What is printed?",
    "options": [
     "7",
     "52",
     "5 2",
     "Error"
    ],
    "answer": 2,
    "explain": "print() with two items puts a space between them.",
    "code": "a = 5\nb = 2\nprint(a, b)"
   },
   {
    "q": "What is the data type of \"2024\"?",
    "options": [
     "integer",
     "real",
     "string",
     "Boolean"
    ],
    "answer": 2,
    "explain": "It is in quotes, so it is a string."
   },
   {
    "q": "What is the value of n after this code?",
    "options": [
     "3",
     "6",
     "9",
     "12"
    ],
    "answer": 2,
    "explain": "n = 3, then n = 3 + 6 = 9.",
    "code": "n = 3\nm = 6\nn = n + m"
   }
  ]
 },
 {
  "id": "p2-input-casting",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Input and type conversion",
  "summary": "Read data from the user with input() and convert it with int(), float() and str().",
  "minutes": 20,
  "steps": [
   {
    "kind": "explain",
    "title": "input() always gives a string",
    "body": "`input(\"prompt\")` shows the prompt, waits for the user and returns what they typed **as a string**.\n\n- `age = input(\"Age: \")` - if the user types 15, age is `\"15\"` (a string)\n- To do maths you must **convert** (cast) it: `age = int(input(\"Age: \"))`\n- Use `float()` for decimals and `str()` to turn a number back into text.",
    "code": "age = int(input(\"Age: \"))\nprice = float(input(\"Price: \"))"
   },
   {
    "kind": "trace",
    "title": "Joining strings vs adding numbers",
    "intro": "This program reads two numbers. The user types 4 and then 5.",
    "code": "a = input(\"First: \")\nb = input(\"Second: \")\nprint(a + b)\nprint(int(a) + int(b))\n",
    "inputs": [
     "4",
     "5"
    ],
    "notes": {
     "3": "a and b are strings, so + JOINS them: \"4\" + \"5\" = \"45\".",
     "4": "int() converts each string to a number, so + adds them: 9."
    },
    "predict": {
     "question": "What does line 3 print?",
     "options": [
      "9",
      "45",
      "4 5",
      "Error"
     ],
     "answer": 1
    },
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "a": "\"4\""
      },
      "out": "First: 4\n"
     },
     {
      "line": 3,
      "vars": {
       "a": "\"4\"",
       "b": "\"5\""
      },
      "out": "First: 4\nSecond: 5\n"
     },
     {
      "line": 4,
      "vars": {
       "a": "\"4\"",
       "b": "\"5\""
      },
      "out": "First: 4\nSecond: 5\n45\n"
     },
     {
      "line": 0,
      "vars": {
       "a": "\"4\"",
       "b": "\"5\""
      },
      "out": "First: 4\nSecond: 5\n45\n9\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "The user types `7`. What is the data type of `n` after `n = input()`?",
    "options": [
     "integer",
     "real",
     "string",
     "Boolean"
    ],
    "answer": 2,
    "hints": [
     "What does input() always return?",
     "input() returns text, whatever the user types."
    ],
    "explain": "input() always returns a string. Use int() to convert it."
   },
   {
    "kind": "explain",
    "title": "Joining text and numbers",
    "body": "`+` can only join a string to another string.\n\n- `print(\"Total: \" + total)` gives an **error** if total is a number.\n- Fix 1: `print(\"Total: \" + str(total))`\n- Fix 2: `print(\"Total:\", total)` - commas handle the conversion for you.",
    "tip": "In the exam, read the required output carefully - spaces and punctuation must match."
   },
   {
    "kind": "trace",
    "title": "Doing a calculation with input",
    "intro": "The user enters a length 3 and a width 4.5.",
    "code": "length = float(input(\"Length: \"))\nwidth = float(input(\"Width: \"))\narea = length * width\nprint(\"Area:\", area)\n",
    "inputs": [
     "3",
     "4.5"
    ],
    "notes": {
     "1": "float() turns the text \"3\" into 3.0.",
     "3": "3.0 * 4.5 = 13.5"
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "length": "3.0"
      },
      "out": "Length: 3\n"
     },
     {
      "line": 3,
      "vars": {
       "length": "3.0",
       "width": "4.5"
      },
      "out": "Length: 3\nWidth: 4.5\n"
     },
     {
      "line": 4,
      "vars": {
       "length": "3.0",
       "width": "4.5",
       "area": "13.5"
      },
      "out": "Length: 3\nWidth: 4.5\n"
     },
     {
      "line": 0,
      "vars": {
       "length": "3.0",
       "width": "4.5",
       "area": "13.5"
      },
      "out": "Length: 3\nWidth: 4.5\nArea: 13.5\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "Fill the gap so `n` stores a whole number typed by the user: `n = ____(input(\"Number: \"))`",
    "accept": [
     "int"
    ],
    "hints": [
     "Which function converts to a whole number?",
     "It is a three-letter word."
    ],
    "explain": "int() converts a string to an integer."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2i-1",
    "title": "Double it",
    "prompt": "Ask the user for a whole number with the prompt `Number: ` and print double the number.\nExample: input 6 prints `12`",
    "starter": "\n",
    "solution": "n = int(input(\"Number: \"))\nprint(n * 2)\n",
    "tests": [
     {
      "inputs": [
       "6"
      ],
      "expected": "12\n"
     },
     {
      "inputs": [
       "15"
      ],
      "expected": "30\n"
     },
     {
      "inputs": [
       "-4"
      ],
      "expected": "-8\n"
     }
    ],
    "hints": [
     "Convert the input with int().",
     "n = int(input(\"Number: \")) then print(n * 2)"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2i-2",
    "title": "Ticket cost",
    "prompt": "Read the number of tickets (`Tickets: `) and the price of one ticket (`Price: `, may have decimals). Print `Total: ` followed by the total cost.\nExample: 3 tickets at 2.5 prints `Total: 7.5`",
    "starter": "\n",
    "solution": "tickets = int(input(\"Tickets: \"))\nprice = float(input(\"Price: \"))\nprint(\"Total:\", tickets * price)\n",
    "tests": [
     {
      "inputs": [
       "3",
       "2.5"
      ],
      "expected": "Total: 7.5\n"
     },
     {
      "inputs": [
       "10",
       "4"
      ],
      "expected": "Total: 40.0\n"
     }
    ],
    "hints": [
     "Tickets is a whole number; price can have decimals - use int() and float().",
     "print(\"Total:\", tickets * price)"
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "What does input() return?",
    "options": [
     "An integer",
     "A string",
     "A real number",
     "It depends what is typed"
    ],
    "answer": 1,
    "explain": "input() always returns a string."
   },
   {
    "q": "The user types 3 and 4. What is printed?",
    "options": [
     "7",
     "34",
     "3 4",
     "Error"
    ],
    "answer": 1,
    "explain": "Both are strings, so + joins them.",
    "code": "a = input()\nb = input()\nprint(a + b)"
   },
   {
    "q": "Which line causes an error?",
    "options": [
     "print(\"Score: \" + str(10))",
     "print(\"Score:\", 10)",
     "print(\"Score: \" + 10)",
     "print(str(10))"
    ],
    "answer": 2,
    "explain": "You cannot use + to join a string and an integer."
   },
   {
    "q": "Which function converts \"2.5\" to a number?",
    "options": [
     "int()",
     "str()",
     "float()",
     "bool()"
    ],
    "answer": 2,
    "explain": "float() converts to a real number. int(\"2.5\") would give an error."
   },
   {
    "q": "What is the value of x?",
    "options": [
     "5",
     "\"5\"",
     "55",
     "Error"
    ],
    "answer": 0,
    "explain": "int(\"5\") converts the string to the integer 5.",
    "code": "x = int(\"5\")"
   }
  ]
 },
 {
  "id": "p2-arithmetic",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Arithmetic operators",
  "summary": "Use +, -, *, /, // (integer division), % (modulus) and ** (power).",
  "minutes": 20,
  "steps": [
   {
    "kind": "explain",
    "title": "The arithmetic operators",
    "body": "- `+` add, `-` subtract, `*` multiply\n- `/` divide - always gives a real: `7 / 2` is `3.5`\n- `//` integer division (quotient) - `7 // 2` is `3`\n- `%` modulus (remainder) - `7 % 2` is `1`\n- `**` exponent (power) - `2 ** 3` is `8`\n\nPython follows **BIDMAS**: brackets first, then powers, then * / // %, then + and -."
   },
   {
    "kind": "trace",
    "title": "Splitting minutes into hours",
    "intro": "// and % are perfect for splitting things up. The user types 135 minutes.",
    "code": "minutes = int(input(\"Minutes: \"))\nhours = minutes // 60\nleft = minutes % 60\nprint(hours, \"h\", left, \"min\")\n",
    "inputs": [
     "135"
    ],
    "notes": {
     "2": "135 // 60 = 2 (how many whole 60s fit).",
     "3": "135 % 60 = 15 (what is left over)."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "minutes": "135"
      },
      "out": "Minutes: 135\n"
     },
     {
      "line": 3,
      "vars": {
       "minutes": "135",
       "hours": "2"
      },
      "out": "Minutes: 135\n"
     },
     {
      "line": 4,
      "vars": {
       "minutes": "135",
       "hours": "2",
       "left": "15"
      },
      "out": "Minutes: 135\n"
     },
     {
      "line": 0,
      "vars": {
       "minutes": "135",
       "hours": "2",
       "left": "15"
      },
      "out": "Minutes: 135\n2 h 15 min\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What is `17 % 5`?",
    "options": [
     "3",
     "2",
     "3.4",
     "12"
    ],
    "answer": 1,
    "hints": [
     "% gives the remainder.",
     "5 goes into 17 three times (15). What is left?"
    ],
    "explain": "17 = 3 x 5 + 2, so the remainder is 2."
   },
   {
    "kind": "trace",
    "title": "Even or odd?",
    "intro": "n % 2 is 0 for even numbers and 1 for odd numbers.",
    "code": "n = 14\nprint(n % 2)\nn = 9\nprint(n % 2)\n",
    "inputs": [],
    "notes": {
     "2": "14 / 2 has no remainder, so 0 (even).",
     "4": "9 / 2 leaves 1, so odd."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "n": "14"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "n": "14"
      },
      "out": "0\n"
     },
     {
      "line": 4,
      "vars": {
       "n": "9"
      },
      "out": "0\n"
     },
     {
      "line": 0,
      "vars": {
       "n": "9"
      },
      "out": "0\n1\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What is `2 + 3 * 4`?",
    "options": [
     "20",
     "14",
     "24",
     "9"
    ],
    "answer": 1,
    "hints": [
     "Which happens first, + or *?",
     "Multiply first: 3 * 4 = 12."
    ],
    "explain": "BIDMAS: 3 * 4 = 12, then 2 + 12 = 14."
   },
   {
    "kind": "check",
    "question": "What is `9 // 4`?",
    "accept": [
     "2"
    ],
    "hints": [
     "// gives only the whole-number part.",
     "4 fits into 9 twice."
    ],
    "explain": "9 // 4 = 2 (the remainder 1 is thrown away)."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2a-1",
    "title": "Pizza sharing",
    "prompt": "Read the number of slices (`Slices: `) and number of people (`People: `). Print how many slices each person gets and how many are left over, in the format:\n`Each: 3 Left: 2`",
    "starter": "\n",
    "solution": "slices = int(input(\"Slices: \"))\npeople = int(input(\"People: \"))\nprint(\"Each:\", slices // people, \"Left:\", slices % people)\n",
    "tests": [
     {
      "inputs": [
       "11",
       "3"
      ],
      "expected": "Each: 3 Left: 2\n"
     },
     {
      "inputs": [
       "8",
       "4"
      ],
      "expected": "Each: 2 Left: 0\n"
     },
     {
      "inputs": [
       "5",
       "7"
      ],
      "expected": "Each: 0 Left: 5\n"
     }
    ],
    "hints": [
     "Use // for the share and % for the leftovers.",
     "print(\"Each:\", slices // people, \"Left:\", slices % people)"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2a-2",
    "title": "Seconds converter",
    "prompt": "Read a number of seconds (`Seconds: `) and print it as minutes and seconds, e.g. 200 prints `3 minutes 20 seconds`",
    "starter": "\n",
    "solution": "s = int(input(\"Seconds: \"))\nprint(s // 60, \"minutes\", s % 60, \"seconds\")\n",
    "tests": [
     {
      "inputs": [
       "200"
      ],
      "expected": "3 minutes 20 seconds\n"
     },
     {
      "inputs": [
       "59"
      ],
      "expected": "0 minutes 59 seconds\n"
     },
     {
      "inputs": [
       "3600"
      ],
      "expected": "60 minutes 0 seconds\n"
     }
    ],
    "hints": [
     "There are 60 seconds in a minute.",
     "minutes = s // 60 and seconds = s % 60"
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "What is 10 / 4?",
    "options": [
     "2",
     "2.5",
     "2.0",
     "3"
    ],
    "answer": 1,
    "explain": "/ always gives a real number."
   },
   {
    "q": "What is 10 // 4?",
    "options": [
     "2",
     "2.5",
     "3",
     "0"
    ],
    "answer": 0,
    "explain": "// is integer division."
   },
   {
    "q": "What is 10 % 4?",
    "options": [
     "2",
     "2.5",
     "0",
     "4"
    ],
    "answer": 0,
    "explain": "10 = 2 x 4 + 2."
   },
   {
    "q": "What is 3 ** 2?",
    "options": [
     "6",
     "9",
     "5",
     "1"
    ],
    "answer": 1,
    "explain": "** is power: 3 squared is 9."
   },
   {
    "q": "What is (2 + 3) * 4?",
    "options": [
     "14",
     "20",
     "24",
     "9"
    ],
    "answer": 1,
    "explain": "Brackets first: 5 * 4 = 20."
   }
  ]
 },
 {
  "id": "p2-selection",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Selection: if, elif and else",
  "summary": "Make decisions with relational operators and if / elif / else.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Relational operators",
    "body": "A **condition** is True or False. Relational operators compare two values:\n\n- `==` equal to, `!=` not equal to\n- `<` less than, `<=` less than or equal to\n- `>` greater than, `>=` greater than or equal to\n\n`if` runs its **indented** block only when the condition is True. `else` runs when it is False.",
    "code": "if mark >= 50:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")",
    "tip": "The colon : and the 4-space indent are part of the syntax."
   },
   {
    "kind": "trace",
    "title": "Big or tiny?",
    "intro": "x is 3. Watch which branch runs.",
    "code": "x = 3\nif x > 5:\n    print(\"BIG!\")\nelse:\n    print(\"tiny\")\n",
    "inputs": [],
    "notes": {
     "2": "Is 3 > 5? No - the condition is False, so Python skips to else.",
     "5": "This is the else branch."
    },
    "predict": {
     "question": "What will be printed?",
     "options": [
      "BIG!",
      "tiny",
      "BIG! and tiny",
      "Nothing"
     ],
     "answer": 1
    },
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "x": "3"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "x": "3"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "x": "3"
      },
      "out": "tiny\n",
      "done": true
     }
    ]
   },
   {
    "kind": "explain",
    "title": "More than two choices: elif",
    "body": "`elif` (else if) lets you check more conditions in order. Python stops at the **first** True condition.\n\nOrder matters! Check the highest grade boundary first.",
    "code": "if mark >= 70:\n    grade = \"A\"\nelif mark >= 50:\n    grade = \"B\"\nelse:\n    grade = \"C\""
   },
   {
    "kind": "trace",
    "title": "Grading a mark",
    "intro": "The mark is 62. Only one branch can run.",
    "code": "mark = 62\nif mark >= 70:\n    grade = \"A\"\nelif mark >= 50:\n    grade = \"B\"\nelse:\n    grade = \"C\"\nprint(\"Grade\", grade)\n",
    "inputs": [],
    "notes": {
     "2": "62 >= 70 is False - try the next condition.",
     "4": "62 >= 50 is True - this branch runs and the rest is skipped."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "mark": "62"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "mark": "62"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "mark": "62"
      },
      "out": ""
     },
     {
      "line": 8,
      "vars": {
       "mark": "62",
       "grade": "\"B\""
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "mark": "62",
       "grade": "\"B\""
      },
      "out": "Grade B\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "`temp = 30`. Which line is printed?",
    "options": [
     "Cold",
     "Warm",
     "Hot",
     "Warm and Hot"
    ],
    "answer": 2,
    "hints": [
     "Check the conditions from the top.",
     "30 > 25 is True, so the first branch runs."
    ],
    "explain": "The first True condition wins: 30 > 25, so Hot.",
    "code": "if temp > 25:\n    print(\"Hot\")\nelif temp > 15:\n    print(\"Warm\")\nelse:\n    print(\"Cold\")"
   },
   {
    "kind": "check",
    "question": "Which operator means 'not equal to'?",
    "options": [
     "<>",
     "=!",
     "!=",
     "=/="
    ],
    "answer": 2,
    "hints": [
     "It uses an exclamation mark.",
     "! then ="
    ],
    "explain": "In Python, != means not equal to."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2s-1",
    "title": "Pass or fail",
    "prompt": "Read a mark (`Mark: `). Print `Pass` if it is 50 or more, otherwise `Fail`.",
    "starter": "mark = int(input(\"Mark: \"))\n",
    "solution": "mark = int(input(\"Mark: \"))\nif mark >= 50:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")\n",
    "tests": [
     {
      "inputs": [
       "50"
      ],
      "expected": "Pass\n"
     },
     {
      "inputs": [
       "49"
      ],
      "expected": "Fail\n"
     },
     {
      "inputs": [
       "100"
      ],
      "expected": "Pass\n"
     }
    ],
    "hints": [
     "50 must pass, so use >= not >.",
     "if mark >= 50:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2s-2",
    "title": "Ticket price",
    "prompt": "Read an age (`Age: `). Under 12 pays `5`, 12 to 64 pays `10`, 65 and over pays `6`. Print `Price: ` and the price.",
    "starter": "age = int(input(\"Age: \"))\n",
    "solution": "age = int(input(\"Age: \"))\nif age < 12:\n    price = 5\nelif age < 65:\n    price = 10\nelse:\n    price = 6\nprint(\"Price:\", price)\n",
    "tests": [
     {
      "inputs": [
       "8"
      ],
      "expected": "Price: 5\n"
     },
     {
      "inputs": [
       "12"
      ],
      "expected": "Price: 10\n"
     },
     {
      "inputs": [
       "64"
      ],
      "expected": "Price: 10\n"
     },
     {
      "inputs": [
       "65"
      ],
      "expected": "Price: 6\n"
     }
    ],
    "hints": [
     "Use if, elif and else.",
     "Check age < 12 first, then age < 65, else the senior price."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "x = 7. Which condition is True?",
    "options": [
     "x < 7",
     "x != 7",
     "x >= 7",
     "x > 7"
    ],
    "answer": 2,
    "explain": "7 >= 7 is True."
   },
   {
    "q": "What is printed?",
    "options": [
     "A",
     "B",
     "A then B",
     "Nothing"
    ],
    "answer": 0,
    "explain": "Python stops at the first True condition.",
    "code": "n = 10\nif n > 5:\n    print(\"A\")\nelif n > 2:\n    print(\"B\")"
   },
   {
    "q": "Which keyword checks another condition after if?",
    "options": [
     "else if",
     "elif",
     "elseif",
     "then"
    ],
    "answer": 1,
    "explain": "Python uses elif."
   },
   {
    "q": "What is printed when score is 40?",
    "options": [
     "Win",
     "Lose",
     "Draw",
     "Error"
    ],
    "answer": 1,
    "explain": "40 > 50 is False, so else runs.",
    "code": "if score > 50:\n    print(\"Win\")\nelse:\n    print(\"Lose\")"
   },
   {
    "q": "Why is indentation important after if?",
    "options": [
     "It makes code faster",
     "It shows which lines belong to the if",
     "It is only for comments",
     "It is optional"
    ],
    "answer": 1,
    "explain": "Indented lines form the block that runs when the condition is True."
   }
  ]
 },
 {
  "id": "p2-logical",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Logical operators: and, or, not",
  "summary": "Combine conditions with and, or and not, and use nested if statements.",
  "minutes": 20,
  "steps": [
   {
    "kind": "explain",
    "title": "Combining conditions",
    "body": "- `and` - True only if **both** conditions are True\n- `or` - True if **at least one** condition is True\n- `not` - reverses True and False\n\nA range check uses `and`: `if age >= 11 and age <= 16:`",
    "code": "if age >= 11 and age <= 16:\n    print(\"Secondary school age\")"
   },
   {
    "kind": "trace",
    "title": "Range check with and",
    "intro": "age is 18. Both parts must be True.",
    "code": "age = 18\nif age >= 11 and age <= 16:\n    print(\"Accepted\")\nelse:\n    print(\"Out of range\")\n",
    "inputs": [],
    "notes": {
     "2": "18 >= 11 is True but 18 <= 16 is False. True and False = False."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "age": "18"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "age": "18"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "age": "18"
      },
      "out": "Out of range\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "`day = \"Sat\"`. Is `day == \"Sat\" or day == \"Sun\"` True or False?",
    "options": [
     "True",
     "False"
    ],
    "answer": 0,
    "hints": [
     "With or, only one part needs to be True.",
     "day == \"Sat\" is True."
    ],
    "explain": "One side is True, so the whole or is True."
   },
   {
    "kind": "trace",
    "title": "Nested if",
    "intro": "An if inside another if. The inner one is only checked when the outer one is True.",
    "code": "member = True\ntotal = 80\nif member:\n    if total > 50:\n        print(\"10% off\")\n    else:\n        print(\"5% off\")\nelse:\n    print(\"No discount\")\n",
    "inputs": [],
    "notes": {
     "3": "member is True, so we go inside.",
     "4": "Now check the inner condition: 80 > 50 is True."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "member": "True"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "member": "True",
       "total": "80"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "member": "True",
       "total": "80"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "member": "True",
       "total": "80"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "member": "True",
       "total": "80"
      },
      "out": "10% off\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What is `not (5 > 3)`?",
    "options": [
     "True",
     "False",
     "5",
     "Error"
    ],
    "answer": 1,
    "hints": [
     "Work out the bracket first.",
     "5 > 3 is True; not True is False."
    ],
    "explain": "not reverses True to False."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2l-1",
    "title": "Valid percentage",
    "prompt": "Read a number (`Value: `). Print `Valid` if it is between 0 and 100 inclusive, otherwise `Invalid`.",
    "starter": "\n",
    "solution": "v = int(input(\"Value: \"))\nif v >= 0 and v <= 100:\n    print(\"Valid\")\nelse:\n    print(\"Invalid\")\n",
    "tests": [
     {
      "inputs": [
       "0"
      ],
      "expected": "Valid\n"
     },
     {
      "inputs": [
       "100"
      ],
      "expected": "Valid\n"
     },
     {
      "inputs": [
       "101"
      ],
      "expected": "Invalid\n"
     },
     {
      "inputs": [
       "-1"
      ],
      "expected": "Invalid\n"
     }
    ],
    "hints": [
     "Use and for a range check.",
     "if v >= 0 and v <= 100:"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2l-2",
    "title": "Weekend checker",
    "prompt": "Read a day (`Day: `). Print `Weekend` if it is Saturday or Sunday, otherwise `Weekday`.",
    "starter": "\n",
    "solution": "day = input(\"Day: \")\nif day == \"Saturday\" or day == \"Sunday\":\n    print(\"Weekend\")\nelse:\n    print(\"Weekday\")\n",
    "tests": [
     {
      "inputs": [
       "Saturday"
      ],
      "expected": "Weekend\n"
     },
     {
      "inputs": [
       "Sunday"
      ],
      "expected": "Weekend\n"
     },
     {
      "inputs": [
       "Monday"
      ],
      "expected": "Weekday\n"
     }
    ],
    "hints": [
     "Use or - either day is fine.",
     "Each side needs its own comparison: day == \"Saturday\" or day == \"Sunday\""
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "True and False gives:",
    "options": [
     "True",
     "False"
    ],
    "answer": 1,
    "explain": "and needs both to be True."
   },
   {
    "q": "True or False gives:",
    "options": [
     "True",
     "False"
    ],
    "answer": 0,
    "explain": "or needs at least one True."
   },
   {
    "q": "Which checks n is from 1 to 10 inclusive?",
    "options": [
     "n > 1 and n < 10",
     "n >= 1 or n <= 10",
     "n >= 1 and n <= 10",
     "n == 1 and n == 10"
    ],
    "answer": 2,
    "explain": "Both limits inclusive, both must be True."
   },
   {
    "q": "x = 4. What is not (x == 4)?",
    "options": [
     "True",
     "False"
    ],
    "answer": 1,
    "explain": "x == 4 is True; not True is False."
   },
   {
    "q": "What is printed?",
    "options": [
     "A",
     "B",
     "Nothing",
     "Error"
    ],
    "answer": 1,
    "explain": "3 > 5 is False so the and is False.",
    "code": "a = 3\nif a > 1 and a > 5:\n    print(\"A\")\nelse:\n    print(\"B\")"
   }
  ]
 },
 {
  "id": "p2-for-loops",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Count-controlled loops (for)",
  "summary": "Repeat code a fixed number of times with for and range(), and keep running totals.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "for loops and range()",
    "body": "A **count-controlled** loop repeats a set number of times.\n\n- `range(5)` gives 0, 1, 2, 3, 4 (stops **before** 5)\n- `range(1, 6)` gives 1, 2, 3, 4, 5\n- `range(0, 10, 2)` gives 0, 2, 4, 6, 8 (step of 2)",
    "code": "for i in range(1, 4):\n    print(i)"
   },
   {
    "kind": "trace",
    "title": "Counting with for",
    "intro": "Watch i change each time round the loop.",
    "code": "for i in range(1, 4):\n    print(\"Lap\", i)\nprint(\"Finished\")\n",
    "inputs": [],
    "notes": {
     "1": "range(1, 4) gives 1, 2, 3 - it stops before 4.",
     "3": "This line is not indented, so it runs once, after the loop."
    },
    "predict": {
     "question": "How many times is 'Lap' printed?",
     "options": [
      "2",
      "3",
      "4",
      "1"
     ],
     "answer": 1
    },
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "i": "1"
      },
      "out": ""
     },
     {
      "line": 1,
      "vars": {
       "i": "1"
      },
      "out": "Lap 1\n"
     },
     {
      "line": 2,
      "vars": {
       "i": "2"
      },
      "out": "Lap 1\n"
     },
     {
      "line": 1,
      "vars": {
       "i": "2"
      },
      "out": "Lap 1\nLap 2\n"
     },
     {
      "line": 2,
      "vars": {
       "i": "3"
      },
      "out": "Lap 1\nLap 2\n"
     },
     {
      "line": 1,
      "vars": {
       "i": "3"
      },
      "out": "Lap 1\nLap 2\nLap 3\n"
     },
     {
      "line": 3,
      "vars": {
       "i": "3"
      },
      "out": "Lap 1\nLap 2\nLap 3\n"
     },
     {
      "line": 0,
      "vars": {
       "i": "3"
      },
      "out": "Lap 1\nLap 2\nLap 3\nFinished\n",
      "done": true
     }
    ]
   },
   {
    "kind": "trace",
    "title": "Running total",
    "intro": "A total starts at 0 and the loop adds to it each time.",
    "code": "total = 0\nfor n in range(1, 5):\n    total = total + n\nprint(\"Total:\", total)\n",
    "inputs": [],
    "notes": {
     "1": "Always set the total to 0 BEFORE the loop.",
     "3": "Each time round, the current n is added on."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "total": "0"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "0",
       "n": "1"
      },
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "total": "1",
       "n": "1"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "1",
       "n": "2"
      },
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "total": "3",
       "n": "2"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "3",
       "n": "3"
      },
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "total": "6",
       "n": "3"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "6",
       "n": "4"
      },
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "total": "10",
       "n": "4"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "total": "10",
       "n": "4"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "total": "10",
       "n": "4"
      },
      "out": "Total: 10\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "Which values does `range(2, 8, 2)` give?",
    "options": [
     "2, 4, 6, 8",
     "2, 4, 6",
     "2, 3, 4, 5, 6, 7",
     "0, 2, 4, 6"
    ],
    "answer": 1,
    "hints": [
     "Start at 2, go up in steps of 2.",
     "Stop BEFORE 8."
    ],
    "explain": "2, 4, 6 - the end value 8 is not included."
   },
   {
    "kind": "check",
    "question": "How many times does this loop print?",
    "accept": [
     "5"
    ],
    "hints": [
     "Count the values range(5) gives.",
     "0, 1, 2, 3, 4"
    ],
    "explain": "range(5) gives five values.",
    "code": "for k in range(5):\n    print(\"Hi\")"
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2f-1",
    "title": "Times table",
    "prompt": "Read a number (`Number: `) and print its 1 to 5 times table, one line each like `3 x 1 = 3`",
    "starter": "n = int(input(\"Number: \"))\n",
    "solution": "n = int(input(\"Number: \"))\nfor i in range(1, 6):\n    print(n, \"x\", i, \"=\", n * i)\n",
    "tests": [
     {
      "inputs": [
       "3"
      ],
      "expected": "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n"
     },
     {
      "inputs": [
       "7"
      ],
      "expected": "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n"
     }
    ],
    "hints": [
     "Use range(1, 6) to get 1 to 5.",
     "print(n, \"x\", i, \"=\", n * i)"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2f-2",
    "title": "Add up the marks",
    "prompt": "Read how many marks there are (`How many: `), then read each mark (`Mark: `). Print `Total: ` and the total.",
    "starter": "\n",
    "solution": "count = int(input(\"How many: \"))\ntotal = 0\nfor i in range(count):\n    mark = int(input(\"Mark: \"))\n    total = total + mark\nprint(\"Total:\", total)\n",
    "tests": [
     {
      "inputs": [
       "3",
       "10",
       "20",
       "5"
      ],
      "expected": "Total: 35\n"
     },
     {
      "inputs": [
       "1",
       "7"
      ],
      "expected": "Total: 7\n"
     }
    ],
    "hints": [
     "Set total = 0 before the loop.",
     "Inside the loop: read a mark and add it to total."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "What does range(4) produce?",
    "options": [
     "1, 2, 3, 4",
     "0, 1, 2, 3",
     "0, 1, 2, 3, 4",
     "4"
    ],
    "answer": 1,
    "explain": "range(n) starts at 0 and stops before n."
   },
   {
    "q": "What is printed last?",
    "options": [
     "3",
     "4",
     "5",
     "6"
    ],
    "answer": 1,
    "explain": "range(1, 5) ends at 4.",
    "code": "for i in range(1, 5):\n    print(i)"
   },
   {
    "q": "What is total after the loop?",
    "options": [
     "6",
     "10",
     "4",
     "0"
    ],
    "answer": 0,
    "explain": "0 + 1 + 2 + 3 = 6.",
    "code": "total = 0\nfor i in range(4):\n    total = total + i"
   },
   {
    "q": "Why is a for loop called count-controlled?",
    "options": [
     "It counts errors",
     "It repeats a known number of times",
     "It stops when a condition is False",
     "It only counts to 10"
    ],
    "answer": 1,
    "explain": "The number of repetitions is set by the range."
   },
   {
    "q": "Where should a running total be set to 0?",
    "options": [
     "Inside the loop",
     "Before the loop",
     "After the loop",
     "It does not matter"
    ],
    "answer": 1,
    "explain": "Inside the loop it would be reset every time."
   }
  ]
 },
 {
  "id": "p2-while-loops",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Condition-controlled loops (while)",
  "summary": "Repeat while a condition is True: sentinel values and input validation.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "while loops",
    "body": "A **condition-controlled** loop repeats **while** its condition is True. You do not always know how many times it will run.\n\nCommon uses:\n- **Validation** - keep asking until the input is acceptable\n- **Sentinel value** - keep going until a special 'stop' value (e.g. -1) is entered",
    "code": "n = int(input(\"1-10: \"))\nwhile n < 1 or n > 10:\n    n = int(input(\"Try again: \"))"
   },
   {
    "kind": "trace",
    "title": "Validation loop",
    "intro": "The user types 15, then 0, then 7.",
    "code": "n = int(input(\"Enter 1-10: \"))\nwhile n < 1 or n > 10:\n    print(\"Invalid\")\n    n = int(input(\"Enter 1-10: \"))\nprint(\"Thanks,\", n)\n",
    "inputs": [
     "15",
     "0",
     "7"
    ],
    "notes": {
     "2": "The condition is checked BEFORE each repeat.",
     "4": "A new value must be read inside the loop, or it would loop forever."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "n": "15"
      },
      "out": "Enter 1-10: 15\n"
     },
     {
      "line": 3,
      "vars": {
       "n": "15"
      },
      "out": "Enter 1-10: 15\n"
     },
     {
      "line": 4,
      "vars": {
       "n": "15"
      },
      "out": "Enter 1-10: 15\nInvalid\n"
     },
     {
      "line": 2,
      "vars": {
       "n": "0"
      },
      "out": "Enter 1-10: 15\nInvalid\nEnter 1-10: 0\n"
     },
     {
      "line": 3,
      "vars": {
       "n": "0"
      },
      "out": "Enter 1-10: 15\nInvalid\nEnter 1-10: 0\n"
     },
     {
      "line": 4,
      "vars": {
       "n": "0"
      },
      "out": "Enter 1-10: 15\nInvalid\nEnter 1-10: 0\nInvalid\n"
     },
     {
      "line": 2,
      "vars": {
       "n": "7"
      },
      "out": "Enter 1-10: 15\nInvalid\nEnter 1-10: 0\nInvalid\nEnter 1-10: 7\n"
     },
     {
      "line": 5,
      "vars": {
       "n": "7"
      },
      "out": "Enter 1-10: 15\nInvalid\nEnter 1-10: 0\nInvalid\nEnter 1-10: 7\n"
     },
     {
      "line": 0,
      "vars": {
       "n": "7"
      },
      "out": "Enter 1-10: 15\nInvalid\nEnter 1-10: 0\nInvalid\nEnter 1-10: 7\nThanks, 7\n",
      "done": true
     }
    ]
   },
   {
    "kind": "trace",
    "title": "Sentinel value",
    "intro": "Keep adding numbers until the user types -1. The user types 5, 8, -1.",
    "code": "total = 0\nnum = int(input(\"Number (-1 to stop): \"))\nwhile num != -1:\n    total = total + num\n    num = int(input(\"Number (-1 to stop): \"))\nprint(\"Total:\", total)\n",
    "inputs": [
     "5",
     "8",
     "-1"
    ],
    "notes": {
     "3": "-1 is the sentinel: when it is entered the loop stops and -1 is NOT added."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "total": "0"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "total": "0",
       "num": "5"
      },
      "out": "Number (-1 to stop): 5\n"
     },
     {
      "line": 4,
      "vars": {
       "total": "0",
       "num": "5"
      },
      "out": "Number (-1 to stop): 5\n"
     },
     {
      "line": 5,
      "vars": {
       "total": "5",
       "num": "5"
      },
      "out": "Number (-1 to stop): 5\n"
     },
     {
      "line": 3,
      "vars": {
       "total": "5",
       "num": "8"
      },
      "out": "Number (-1 to stop): 5\nNumber (-1 to stop): 8\n"
     },
     {
      "line": 4,
      "vars": {
       "total": "5",
       "num": "8"
      },
      "out": "Number (-1 to stop): 5\nNumber (-1 to stop): 8\n"
     },
     {
      "line": 5,
      "vars": {
       "total": "13",
       "num": "8"
      },
      "out": "Number (-1 to stop): 5\nNumber (-1 to stop): 8\n"
     },
     {
      "line": 3,
      "vars": {
       "total": "13",
       "num": "-1"
      },
      "out": "Number (-1 to stop): 5\nNumber (-1 to stop): 8\nNumber (-1 to stop): -1\n"
     },
     {
      "line": 6,
      "vars": {
       "total": "13",
       "num": "-1"
      },
      "out": "Number (-1 to stop): 5\nNumber (-1 to stop): 8\nNumber (-1 to stop): -1\n"
     },
     {
      "line": 0,
      "vars": {
       "total": "13",
       "num": "-1"
      },
      "out": "Number (-1 to stop): 5\nNumber (-1 to stop): 8\nNumber (-1 to stop): -1\nTotal: 13\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What happens if the loop body never changes the variable in the condition?",
    "options": [
     "The loop runs once",
     "It never runs",
     "It may loop forever (infinite loop)",
     "Python fixes it"
    ],
    "answer": 2,
    "hints": [
     "Think about whether the condition can ever become False.",
     "If nothing changes, the condition stays True."
    ],
    "explain": "An infinite loop - the condition never becomes False."
   },
   {
    "kind": "check",
    "question": "How many times is 'Hi' printed?",
    "accept": [
     "3"
    ],
    "hints": [
     "Trace c: 0, 1, 2, 3...",
     "The loop stops when c is 3."
    ],
    "explain": "c is 0, 1, 2 when the condition is True, so 3 times.",
    "code": "c = 0\nwhile c < 3:\n    print(\"Hi\")\n    c = c + 1"
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2w-1",
    "title": "Password retry",
    "prompt": "Keep asking `Password: ` until the user types `secret`. Then print `Access granted`.",
    "starter": "\n",
    "solution": "pw = input(\"Password: \")\nwhile pw != \"secret\":\n    pw = input(\"Password: \")\nprint(\"Access granted\")\n",
    "tests": [
     {
      "inputs": [
       "abc",
       "secret"
      ],
      "expected": "Access granted\n"
     },
     {
      "inputs": [
       "secret"
      ],
      "expected": "Access granted\n"
     }
    ],
    "hints": [
     "Read once before the loop, and again inside it.",
     "while pw != \"secret\":"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2w-2",
    "title": "Average until zero",
    "prompt": "Read numbers (`Number: `) until 0 is entered. Print `Count: ` and how many numbers were entered (not counting the 0).",
    "starter": "\n",
    "solution": "count = 0\nn = int(input(\"Number: \"))\nwhile n != 0:\n    count = count + 1\n    n = int(input(\"Number: \"))\nprint(\"Count:\", count)\n",
    "tests": [
     {
      "inputs": [
       "4",
       "9",
       "2",
       "0"
      ],
      "expected": "Count: 3\n"
     },
     {
      "inputs": [
       "0"
      ],
      "expected": "Count: 0\n"
     }
    ],
    "hints": [
     "0 is the sentinel value.",
     "Add 1 to count inside the loop, before reading the next number."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "A while loop repeats...",
    "options": [
     "a fixed number of times",
     "while its condition is True",
     "until its condition is True",
     "exactly once"
    ],
    "answer": 1,
    "explain": "while = condition-controlled."
   },
   {
    "q": "What is a sentinel value?",
    "options": [
     "The first value",
     "A value that signals the end of input",
     "An invalid value",
     "The loop counter"
    ],
    "answer": 1,
    "explain": "e.g. -1 to stop."
   },
   {
    "q": "How many times does this loop run?",
    "options": [
     "0",
     "1",
     "5",
     "Forever"
    ],
    "answer": 0,
    "explain": "5 < 3 is False straight away.",
    "code": "x = 5\nwhile x < 3:\n    x = x + 1"
   },
   {
    "q": "Which is best for 'keep asking until valid'?",
    "options": [
     "for loop",
     "while loop",
     "if statement",
     "range()"
    ],
    "answer": 1,
    "explain": "We do not know how many attempts are needed."
   },
   {
    "q": "What is printed?",
    "options": [
     "8",
     "16",
     "32",
     "4"
    ],
    "answer": 1,
    "explain": "1, 2, 4, 8, 16 - stops when n >= 10.",
    "code": "n = 1\nwhile n < 10:\n    n = n * 2\nprint(n)"
   }
  ]
 },
 {
  "id": "p2-strings",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Strings: length, indexing and slicing",
  "summary": "Work with text: len(), indexes, slices, upper()/lower() and looping through characters.",
  "minutes": 25,
  "steps": [
   {
    "kind": "explain",
    "title": "Strings are sequences of characters",
    "body": "Each character has an **index**, starting at **0**.\n\n`word = \"PYTHON\"` - P is index 0, Y is 1, ... N is 5.\n\n- `len(word)` gives 6\n- `word[0]` is `\"P\"`, `word[-1]` is the last character `\"N\"`\n- `word[1:4]` is a **slice**: indexes 1, 2, 3 - `\"YTH\"` (stops before 4)\n- `word.upper()`, `word.lower()` change the case"
   },
   {
    "kind": "trace",
    "title": "Indexing and slicing",
    "intro": "Step through and watch each value.",
    "code": "word = \"PYTHON\"\nn = len(word)\nfirst = word[0]\nlast = word[n - 1]\nmiddle = word[1:4]\nprint(first, last, middle)\n",
    "inputs": [],
    "notes": {
     "4": "The last index is always len - 1, here 5.",
     "5": "Slice 1:4 takes indexes 1, 2, 3."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "word": "\"PYTHON\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"PYTHON\"",
       "n": "6"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "word": "\"PYTHON\"",
       "n": "6",
       "first": "\"P\""
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "word": "\"PYTHON\"",
       "n": "6",
       "first": "\"P\"",
       "last": "\"N\""
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "word": "\"PYTHON\"",
       "n": "6",
       "first": "\"P\"",
       "last": "\"N\"",
       "middle": "\"YTH\""
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "word": "\"PYTHON\"",
       "n": "6",
       "first": "\"P\"",
       "last": "\"N\"",
       "middle": "\"YTH\""
      },
      "out": "P N YTH\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What is `\"COMPUTER\"[3]`?",
    "options": [
     "M",
     "P",
     "U",
     "O"
    ],
    "answer": 1,
    "hints": [
     "Indexes start at 0.",
     "C=0, O=1, M=2, P=3"
    ],
    "explain": "Counting from 0: C O M P - index 3 is P."
   },
   {
    "kind": "trace",
    "title": "Looping through a string",
    "intro": "Count the vowels in a word.",
    "code": "word = \"banana\"\nvowels = 0\nfor letter in word:\n    if letter in \"aeiou\":\n        vowels = vowels + 1\nprint(\"Vowels:\", vowels)\n",
    "inputs": [],
    "notes": {
     "3": "The loop gives one character at a time.",
     "4": "in checks if the letter appears in the string 'aeiou'."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "word": "\"banana\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"banana\"",
       "vowels": "0"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "word": "\"banana\"",
       "vowels": "0",
       "letter": "\"b\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"banana\"",
       "vowels": "0",
       "letter": "\"b\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "word": "\"banana\"",
       "vowels": "0",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "word": "\"banana\"",
       "vowels": "0",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"banana\"",
       "vowels": "1",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "word": "\"banana\"",
       "vowels": "1",
       "letter": "\"n\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"banana\"",
       "vowels": "1",
       "letter": "\"n\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "word": "\"banana\"",
       "vowels": "1",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "word": "\"banana\"",
       "vowels": "1",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"banana\"",
       "vowels": "2",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "word": "\"banana\"",
       "vowels": "2",
       "letter": "\"n\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"banana\"",
       "vowels": "2",
       "letter": "\"n\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "word": "\"banana\"",
       "vowels": "2",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "word": "\"banana\"",
       "vowels": "2",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "word": "\"banana\"",
       "vowels": "3",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "word": "\"banana\"",
       "vowels": "3",
       "letter": "\"a\""
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "word": "\"banana\"",
       "vowels": "3",
       "letter": "\"a\""
      },
      "out": "Vowels: 3\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What is `\"keyboard\"[0:3]`?",
    "accept": [
     "key",
     "\"key\"",
     "'key'"
    ],
    "hints": [
     "Take indexes 0, 1, 2.",
     "Stop before index 3."
    ],
    "explain": "Indexes 0-2 give 'key'."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2st-1",
    "title": "Initials",
    "prompt": "Read a first name (`First: `) and a surname (`Surname: `). Print the initials in capitals, e.g. `AB`",
    "starter": "\n",
    "solution": "first = input(\"First: \")\nsurname = input(\"Surname: \")\nprint((first[0] + surname[0]).upper())\n",
    "tests": [
     {
      "inputs": [
       "ava",
       "brown"
      ],
      "expected": "AB\n"
     },
     {
      "inputs": [
       "Leo",
       "Kim"
      ],
      "expected": "LK\n"
     }
    ],
    "hints": [
     "The first letter is at index 0.",
     "Join the two letters with + and use .upper()"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2st-2",
    "title": "Username",
    "prompt": "Read a name (`Name: `) and a year (`Year: `). Print a username made of the first 3 letters of the name in lower case followed by the last 2 digits of the year. Example: Samira, 2010 gives `sam10`",
    "starter": "\n",
    "solution": "name = input(\"Name: \")\nyear = input(\"Year: \")\nprint(name[0:3].lower() + year[-2:])\n",
    "tests": [
     {
      "inputs": [
       "Samira",
       "2010"
      ],
      "expected": "sam10\n"
     },
     {
      "inputs": [
       "Tom",
       "2009"
      ],
      "expected": "tom09\n"
     }
    ],
    "hints": [
     "Keep the year as a string so you can slice it.",
     "name[0:3].lower() + year[-2:]"
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "What is len(\"hello\")?",
    "options": [
     "4",
     "5",
     "6",
     "0"
    ],
    "answer": 1,
    "explain": "Five characters."
   },
   {
    "q": "What is \"hello\"[1]?",
    "options": [
     "h",
     "e",
     "l",
     "o"
    ],
    "answer": 1,
    "explain": "Index 0 is h, index 1 is e."
   },
   {
    "q": "What is \"computer\"[0:4]?",
    "options": [
     "comp",
     "compu",
     "omp",
     "ompu"
    ],
    "answer": 0,
    "explain": "Indexes 0, 1, 2, 3."
   },
   {
    "q": "What does \"Hi\".upper() give?",
    "options": [
     "hi",
     "HI",
     "Hi",
     "hI"
    ],
    "answer": 1,
    "explain": "upper() makes all letters capitals."
   },
   {
    "q": "Which index is the last character of a string s?",
    "options": [
     "len(s)",
     "len(s) - 1",
     "0",
     "1"
    ],
    "answer": 1,
    "explain": "Indexes start at 0, so the last is len - 1."
   }
  ]
 },
 {
  "id": "p2-lists",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Lists (one-dimensional arrays)",
  "summary": "Store many values in one list, traverse it, and find totals, highest and lowest.",
  "minutes": 30,
  "steps": [
   {
    "kind": "explain",
    "title": "Lists",
    "body": "A **list** (array) stores many items under one name. Each item has an index starting at 0.\n\n- `scores = [12, 7, 15, 9]`\n- `scores[0]` is 12, `len(scores)` is 4\n- `scores.append(20)` adds to the end\n- `scores[1] = 8` changes an item"
   },
   {
    "kind": "trace",
    "title": "Traversing a list",
    "intro": "Add every score using an index loop.",
    "code": "scores = [12, 7, 15, 9]\ntotal = 0\nfor i in range(len(scores)):\n    total = total + scores[i]\nprint(\"Total:\", total)\nprint(\"Average:\", total / len(scores))\n",
    "inputs": [],
    "notes": {
     "3": "range(len(scores)) gives the indexes 0, 1, 2, 3.",
     "4": "scores[i] is the item at index i."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "scores": "[12, 7, 15, 9]"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "0"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "0",
       "i": "0"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "12",
       "i": "0"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "12",
       "i": "1"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "19",
       "i": "1"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "19",
       "i": "2"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "34",
       "i": "2"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "34",
       "i": "3"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "43",
       "i": "3"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "43",
       "i": "3"
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "43",
       "i": "3"
      },
      "out": "Total: 43\n"
     },
     {
      "line": 0,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "total": "43",
       "i": "3"
      },
      "out": "Total: 43\nAverage: 10.75\n",
      "done": true
     }
    ]
   },
   {
    "kind": "trace",
    "title": "Finding the highest value",
    "intro": "Assume the first item is the highest, then compare with each of the others.",
    "code": "scores = [12, 7, 15, 9]\nhighest = scores[0]\nfor s in scores:\n    if s > highest:\n        highest = s\nprint(\"Highest:\", highest)\n",
    "inputs": [],
    "notes": {
     "2": "Start with the first item - never start with 0 (what if all values are negative?).",
     "4": "If this item beats the best so far, it becomes the new best."
    },
    "predict": {
     "question": "What is printed?",
     "options": [
      "12",
      "15",
      "9",
      "43"
     ],
     "answer": 1
    },
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "scores": "[12, 7, 15, 9]"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "12"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "12",
       "s": "12"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "12",
       "s": "12"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "12",
       "s": "7"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "12",
       "s": "7"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "12",
       "s": "15"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "12",
       "s": "15"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "15",
       "s": "15"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "15",
       "s": "9"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "15",
       "s": "9"
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "15",
       "s": "9"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "scores": "[12, 7, 15, 9]",
       "highest": "15",
       "s": "9"
      },
      "out": "Highest: 15\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "`names = [\"Ali\", \"Bo\", \"Cy\"]`. What is `names[2]`?",
    "options": [
     "Bo",
     "Cy",
     "Ali",
     "Error"
    ],
    "answer": 1,
    "hints": [
     "Indexes start at 0.",
     "Ali=0, Bo=1, Cy=2"
    ],
    "explain": "Index 2 is the third item, Cy."
   },
   {
    "kind": "explain",
    "title": "Parallel lists",
    "body": "**Parallel lists** store related data at the **same index** in different lists.\n\n`names = [\"Ali\", \"Bo\", \"Cy\"]` and `marks = [56, 81, 73]` - Bo's mark is at index 1 in both.\n\nWhen you find the best mark's **index**, use that same index to get the name.",
    "code": "best = 0\nfor i in range(len(marks)):\n    if marks[i] > marks[best]:\n        best = i\nprint(names[best])"
   },
   {
    "kind": "check",
    "question": "What is `len([4, 8, 15, 16, 23, 42])`?",
    "accept": [
     "6"
    ],
    "hints": [
     "Count the items.",
     "There are six numbers."
    ],
    "explain": "There are 6 items."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2li-1",
    "title": "Lowest temperature",
    "prompt": "The list `temps` is given. Print `Lowest: ` and the lowest value using a loop (do not use min()).",
    "starter": "temps = [14, 9, 17, 6, 11]\n",
    "solution": "temps = [14, 9, 17, 6, 11]\nlowest = temps[0]\nfor t in temps:\n    if t < lowest:\n        lowest = t\nprint(\"Lowest:\", lowest)\n",
    "tests": [
     {
      "inputs": [],
      "expected": "Lowest: 6\n"
     }
    ],
    "hints": [
     "Start with lowest = temps[0].",
     "If t < lowest, update lowest."
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2li-2",
    "title": "Top student",
    "prompt": "Two parallel lists are given. Print the name of the student with the highest mark, e.g. `Top: Bo`",
    "starter": "names = [\"Ali\", \"Bo\", \"Cy\", \"Di\"]\nmarks = [56, 81, 73, 79]\n",
    "solution": "names = [\"Ali\", \"Bo\", \"Cy\", \"Di\"]\nmarks = [56, 81, 73, 79]\nbest = 0\nfor i in range(len(marks)):\n    if marks[i] > marks[best]:\n        best = i\nprint(\"Top:\", names[best])\n",
    "tests": [
     {
      "inputs": [],
      "expected": "Top: Bo\n"
     }
    ],
    "hints": [
     "Keep the INDEX of the best mark, not just the mark.",
     "Then print names[best]."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "What is the index of the first item in a list?",
    "options": [
     "1",
     "0",
     "-1",
     "It varies"
    ],
    "answer": 1,
    "explain": "Lists are zero-indexed."
   },
   {
    "q": "What does nums.append(5) do?",
    "options": [
     "Removes 5",
     "Adds 5 to the end",
     "Adds 5 to the start",
     "Sorts the list"
    ],
    "answer": 1,
    "explain": "append adds to the end."
   },
   {
    "q": "What is printed?",
    "options": [
     "3",
     "7",
     "9",
     "Error"
    ],
    "answer": 2,
    "explain": "Index 2 is the third item.",
    "code": "v = [3, 7, 9]\nprint(v[2])"
   },
   {
    "q": "What are parallel lists?",
    "options": [
     "Lists of equal length only",
     "Lists where the same index holds related data",
     "Lists that are sorted",
     "2D lists"
    ],
    "answer": 1,
    "explain": "Same index = same record."
   },
   {
    "q": "Why set highest = values[0] rather than 0?",
    "options": [
     "It is faster",
     "All values might be negative",
     "0 is not allowed",
     "It sorts the list"
    ],
    "answer": 1,
    "explain": "Starting at 0 would be wrong if all values are below 0."
   }
  ]
 },
 {
  "id": "p2-2d-lists",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Two-dimensional lists",
  "summary": "Store a table of data in a 2D list and process it with nested loops.",
  "minutes": 30,
  "steps": [
   {
    "kind": "explain",
    "title": "A list of lists",
    "body": "A **2D list** is like a table: a list where each item is a row (another list).\n\n`results = [[\"Ali\", 56, 70], [\"Bo\", 81, 64]]`\n\n- `results[1]` is the row `[\"Bo\", 81, 64]`\n- `results[1][0]` is `\"Bo\"` - **row first, then column**\n- `len(results)` is the number of rows; `len(results[0])` the number of columns"
   },
   {
    "kind": "trace",
    "title": "Reading one row at a time",
    "intro": "Each row holds a name and two test marks.",
    "code": "results = [[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]\nfor row in results:\n    total = row[1] + row[2]\n    print(row[0], total)\n",
    "inputs": [],
    "notes": {
     "2": "row is one whole inner list at a time.",
     "3": "row[1] and row[2] are the two marks."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Ali\", 56, 70]"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Ali\", 56, 70]",
       "total": "126"
      },
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Ali\", 56, 70]",
       "total": "126"
      },
      "out": "Ali 126\n"
     },
     {
      "line": 3,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Bo\", 81, 64]",
       "total": "126"
      },
      "out": "Ali 126\n"
     },
     {
      "line": 4,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Bo\", 81, 64]",
       "total": "145"
      },
      "out": "Ali 126\n"
     },
     {
      "line": 2,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Bo\", 81, 64]",
       "total": "145"
      },
      "out": "Ali 126\nBo 145\n"
     },
     {
      "line": 3,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Cy\", 73, 90]",
       "total": "145"
      },
      "out": "Ali 126\nBo 145\n"
     },
     {
      "line": 4,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Cy\", 73, 90]",
       "total": "163"
      },
      "out": "Ali 126\nBo 145\n"
     },
     {
      "line": 2,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Cy\", 73, 90]",
       "total": "163"
      },
      "out": "Ali 126\nBo 145\nCy 163\n"
     },
     {
      "line": 0,
      "vars": {
       "results": "[[\"Ali\", 56, 70], [\"Bo\", 81, 64], [\"Cy\", 73, 90]]",
       "row": "[\"Cy\", 73, 90]",
       "total": "163"
      },
      "out": "Ali 126\nBo 145\nCy 163\n",
      "done": true
     }
    ]
   },
   {
    "kind": "trace",
    "title": "Nested loops with indexes",
    "intro": "Total every number in a grid using a loop inside a loop.",
    "code": "grid = [[1, 2, 3], [4, 5, 6]]\ntotal = 0\nfor r in range(len(grid)):\n    for c in range(len(grid[r])):\n        total = total + grid[r][c]\nprint(\"Total:\", total)\n",
    "inputs": [],
    "notes": {
     "3": "The outer loop picks the row.",
     "4": "The inner loop goes along every column of that row.",
     "5": "grid[r][c] - row first, then column."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "0"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "0",
       "r": "0"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "0",
       "r": "0",
       "c": "0"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "1",
       "r": "0",
       "c": "0"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "1",
       "r": "0",
       "c": "1"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "3",
       "r": "0",
       "c": "1"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "3",
       "r": "0",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "6",
       "r": "0",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "6",
       "r": "0",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "6",
       "r": "1",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "6",
       "r": "1",
       "c": "0"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "10",
       "r": "1",
       "c": "0"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "10",
       "r": "1",
       "c": "1"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "15",
       "r": "1",
       "c": "1"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "15",
       "r": "1",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "21",
       "r": "1",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "21",
       "r": "1",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "21",
       "r": "1",
       "c": "2"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "grid": "[[1, 2, 3], [4, 5, 6]]",
       "total": "21",
       "r": "1",
       "c": "2"
      },
      "out": "Total: 21\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "`t = [[\"a\", \"b\"], [\"c\", \"d\"], [\"e\", \"f\"]]`. What is `t[2][0]`?",
    "options": [
     "b",
     "c",
     "e",
     "f"
    ],
    "answer": 2,
    "hints": [
     "First choose the row (index 2).",
     "Row 2 is [\"e\", \"f\"]. Now take column 0."
    ],
    "explain": "Row 2 is [\"e\", \"f\"], column 0 is \"e\"."
   },
   {
    "kind": "check",
    "question": "How many rows does `[[1, 2], [3, 4], [5, 6], [7, 8]]` have?",
    "accept": [
     "4"
    ],
    "hints": [
     "Count the inner lists.",
     "Each [ , ] pair inside is one row."
    ],
    "explain": "There are 4 inner lists, so 4 rows."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2d-1",
    "title": "Row totals",
    "prompt": "Print each player's name and their total of the three scores, one per line, e.g. `Ali 18`",
    "starter": "scores = [[\"Ali\", 5, 6, 7], [\"Bo\", 9, 2, 4], [\"Cy\", 8, 8, 1]]\n",
    "solution": "scores = [[\"Ali\", 5, 6, 7], [\"Bo\", 9, 2, 4], [\"Cy\", 8, 8, 1]]\nfor row in scores:\n    print(row[0], row[1] + row[2] + row[3])\n",
    "tests": [
     {
      "inputs": [],
      "expected": "Ali 18\nBo 15\nCy 17\n"
     }
    ],
    "hints": [
     "Loop through each row.",
     "The scores are at indexes 1, 2 and 3 of each row."
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2d-2",
    "title": "Count the seats",
    "prompt": "`seats` is a cinema plan: \"X\" is booked and \"-\" is free. Print `Free: ` and the number of free seats.",
    "starter": "seats = [[\"X\", \"-\", \"-\", \"X\"], [\"-\", \"-\", \"X\", \"X\"], [\"X\", \"X\", \"X\", \"-\"]]\n",
    "solution": "seats = [[\"X\", \"-\", \"-\", \"X\"], [\"-\", \"-\", \"X\", \"X\"], [\"X\", \"X\", \"X\", \"-\"]]\nfree = 0\nfor row in seats:\n    for s in row:\n        if s == \"-\":\n            free = free + 1\nprint(\"Free:\", free)\n",
    "tests": [
     {
      "inputs": [],
      "expected": "Free: 5\n"
     }
    ],
    "hints": [
     "Use a loop inside a loop.",
     "Add 1 whenever the seat is \"-\"."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "In data[2][1], what does 2 refer to?",
    "options": [
     "The column",
     "The row",
     "The value",
     "The length"
    ],
    "answer": 1,
    "explain": "Row first, then column."
   },
   {
    "q": "What is printed?",
    "options": [
     "2",
     "3",
     "4",
     "5"
    ],
    "answer": 1,
    "explain": "Row 1 is [3, 4]; column 0 is 3.",
    "code": "m = [[1, 2], [3, 4]]\nprint(m[1][0])"
   },
   {
    "q": "How do you visit every cell of a 2D list?",
    "options": [
     "One for loop",
     "A loop inside a loop",
     "An if statement",
     "append()"
    ],
    "answer": 1,
    "explain": "Nested loops: rows then columns."
   },
   {
    "q": "What is len(grid) for a grid with 3 rows and 5 columns?",
    "options": [
     "3",
     "5",
     "8",
     "15"
    ],
    "answer": 0,
    "explain": "len gives the number of rows."
   },
   {
    "q": "Which line changes the item in row 0, column 2 to 9?",
    "options": [
     "g[2][0] = 9",
     "g[0][2] = 9",
     "g[0, 2] = 9",
     "g(0)(2) = 9"
    ],
    "answer": 1,
    "explain": "Row first, then column."
   }
  ]
 },
 {
  "id": "p2-subprograms",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "Subprograms: procedures and functions",
  "summary": "Write reusable subprograms with parameters, return values and local variables.",
  "minutes": 30,
  "steps": [
   {
    "kind": "explain",
    "title": "Why use subprograms?",
    "body": "A **subprogram** is a named block of code you can call many times.\n\n- **Procedure** - does a job, does not return a value\n- **Function** - returns a value with `return`\n- **Parameters** - values passed in when it is called\n- Variables created inside are **local** - they only exist while it runs\n\nBenefits: less repeated code, easier to test and to read, can be shared by a team.",
    "code": "def area(width, height):\n    return width * height\n\nprint(area(3, 4))"
   },
   {
    "kind": "trace",
    "title": "Calling a function",
    "intro": "Watch the program jump into the function and back again.",
    "code": "def area(width, height):\n    result = width * height\n    return result\n\nroom = area(3, 4)\nhall = area(2, 10)\nprint(room + hall)\n",
    "inputs": [],
    "notes": {
     "1": "def only DEFINES the function - nothing runs yet.",
     "5": "Calling area(3, 4): width becomes 3 and height becomes 4.",
     "3": "return sends the answer back to where the function was called."
    },
    "predict": {
     "question": "What is printed?",
     "options": [
      "12",
      "20",
      "32",
      "7"
     ],
     "answer": 2
    },
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 5,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "width (in area)": "3",
       "height (in area)": "4"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "width (in area)": "3",
       "height (in area)": "4",
       "result (in area)": "12"
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "room": "12"
      },
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "room": "12",
       "width (in area)": "2",
       "height (in area)": "10"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "room": "12",
       "width (in area)": "2",
       "height (in area)": "10",
       "result (in area)": "20"
      },
      "out": ""
     },
     {
      "line": 7,
      "vars": {
       "room": "12",
       "hall": "20"
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "room": "12",
       "hall": "20"
      },
      "out": "32\n",
      "done": true
     }
    ]
   },
   {
    "kind": "trace",
    "title": "A procedure",
    "intro": "This subprogram prints a line; it does not return anything.",
    "code": "def banner(text):\n    print(\"*\" * len(text))\n    print(text)\n    print(\"*\" * len(text))\n\nbanner(\"HELLO\")\n",
    "inputs": [],
    "notes": {
     "2": "\"*\" * 5 repeats the star 5 times."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 6,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "text (in banner)": "\"HELLO\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "text (in banner)": "\"HELLO\""
      },
      "out": "*****\n"
     },
     {
      "line": 4,
      "vars": {
       "text (in banner)": "\"HELLO\""
      },
      "out": "*****\nHELLO\n"
     },
     {
      "line": 0,
      "vars": {},
      "out": "*****\nHELLO\n*****\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "What is the difference between a function and a procedure?",
    "options": [
     "A function has parameters",
     "A function returns a value",
     "A procedure is faster",
     "There is no difference"
    ],
    "answer": 1,
    "hints": [
     "Think about the return keyword.",
     "Which one sends a value back?"
    ],
    "explain": "A function returns a value; a procedure does not."
   },
   {
    "kind": "check",
    "question": "A variable created inside a function is...",
    "options": [
     "global",
     "local",
     "a constant",
     "a parameter"
    ],
    "answer": 1,
    "hints": [
     "Can the main program see it?",
     "It only exists while the function runs."
    ],
    "explain": "It is a local variable."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2sp-1",
    "title": "VAT function",
    "prompt": "Write a function `add_vat(price)` that returns the price plus 20%. The given code prints the result for 50 and 12.5.",
    "starter": "def add_vat(price):\n    # return the price plus 20%\n    return 0  # replace this\n\nprint(add_vat(50))\nprint(add_vat(12.5))\n",
    "solution": "def add_vat(price):\n    return price * 1.2\n\nprint(add_vat(50))\nprint(add_vat(12.5))\n",
    "tests": [
     {
      "inputs": [],
      "expected": "60.0\n15.0\n"
     }
    ],
    "hints": [
     "Adding 20% is the same as multiplying by 1.2.",
     "return price * 1.2"
    ],
    "files": {}
   },
   {
    "kind": "code",
    "id": "p2sp-2",
    "title": "Is it even?",
    "prompt": "Write a function `is_even(n)` that returns True if n is even and False otherwise. Then read a number (`Number: `) and print the result.",
    "starter": "\n",
    "solution": "def is_even(n):\n    return n % 2 == 0\n\nnum = int(input(\"Number: \"))\nprint(is_even(num))\n",
    "tests": [
     {
      "inputs": [
       "4"
      ],
      "expected": "True\n"
     },
     {
      "inputs": [
       "7"
      ],
      "expected": "False\n"
     }
    ],
    "hints": [
     "n % 2 is 0 for even numbers.",
     "return n % 2 == 0 returns True or False."
    ],
    "files": {}
   }
  ],
  "quiz": [
   {
    "q": "Which keyword defines a subprogram in Python?",
    "options": [
     "sub",
     "def",
     "function",
     "proc"
    ],
    "answer": 1,
    "explain": "def defines a subprogram."
   },
   {
    "q": "What does return do?",
    "options": [
     "Prints a value",
     "Sends a value back to the caller",
     "Ends the program",
     "Repeats the function"
    ],
    "answer": 1,
    "explain": "return passes a value back."
   },
   {
    "q": "What is printed?",
    "options": [
     "5",
     "6",
     "9",
     "Error"
    ],
    "answer": 2,
    "explain": "triple(3) returns 9.",
    "code": "def triple(x):\n    return x * 3\n\nprint(triple(3))"
   },
   {
    "q": "What is a parameter?",
    "options": [
     "A global variable",
     "A value passed into a subprogram",
     "A loop counter",
     "A return value"
    ],
    "answer": 1,
    "explain": "Parameters receive the values passed in."
   },
   {
    "q": "Give one benefit of subprograms.",
    "options": [
     "They make code longer",
     "Code can be reused",
     "They remove all errors",
     "They are needed for print()"
    ],
    "answer": 1,
    "explain": "Reuse, easier testing and reading."
   }
  ]
 },
 {
  "id": "p2-files",
  "paper": "Paper 2",
  "spec": "Topic 2",
  "title": "File handling",
  "summary": "Read data from text files, split lines into fields, and write results to a file.",
  "minutes": 30,
  "steps": [
   {
    "kind": "explain",
    "title": "Opening, reading and closing",
    "body": "Data in a file stays after the program ends.\n\n- `f = open(\"data.txt\", \"r\")` - open for **reading**\n- `\"w\"` - write (creates a new file / replaces the old one), `\"a\"` - append to the end\n- `for line in f:` reads one line at a time\n- `line.strip()` removes the newline; `line.split(\",\")` splits a CSV line into a list\n- `f.close()` when you have finished"
   },
   {
    "kind": "trace",
    "title": "Reading a CSV file",
    "intro": "scores.txt holds a name and a score on each line.",
    "code": "f = open(\"scores.txt\", \"r\")\nfor line in f:\n    parts = line.strip().split(\",\")\n    name = parts[0]\n    score = int(parts[1])\n    print(name, \"scored\", score)\nf.close()\n",
    "inputs": [],
    "notes": {
     "3": "strip() removes the newline, split(\",\") makes a list such as [\"Ava\", \"72\"].",
     "5": "Data read from a file is text - convert numbers with int()."
    },
    "predict": null,
    "files": {
     "scores.txt": "Ava,72\nBen,64\nCal,88\n"
    },
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {},
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "line": "\"Ava,72\n\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "line": "\"Ava,72\n\"",
       "parts": "[\"Ava\", \"72\"]"
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "line": "\"Ava,72\n\"",
       "parts": "[\"Ava\", \"72\"]",
       "name": "\"Ava\""
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "line": "\"Ava,72\n\"",
       "parts": "[\"Ava\", \"72\"]",
       "name": "\"Ava\"",
       "score": "72"
      },
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "line": "\"Ava,72\n\"",
       "parts": "[\"Ava\", \"72\"]",
       "name": "\"Ava\"",
       "score": "72"
      },
      "out": "Ava scored 72\n"
     },
     {
      "line": 3,
      "vars": {
       "line": "\"Ben,64\n\"",
       "parts": "[\"Ava\", \"72\"]",
       "name": "\"Ava\"",
       "score": "72"
      },
      "out": "Ava scored 72\n"
     },
     {
      "line": 4,
      "vars": {
       "line": "\"Ben,64\n\"",
       "parts": "[\"Ben\", \"64\"]",
       "name": "\"Ava\"",
       "score": "72"
      },
      "out": "Ava scored 72\n"
     },
     {
      "line": 5,
      "vars": {
       "line": "\"Ben,64\n\"",
       "parts": "[\"Ben\", \"64\"]",
       "name": "\"Ben\"",
       "score": "72"
      },
      "out": "Ava scored 72\n"
     },
     {
      "line": 6,
      "vars": {
       "line": "\"Ben,64\n\"",
       "parts": "[\"Ben\", \"64\"]",
       "name": "\"Ben\"",
       "score": "64"
      },
      "out": "Ava scored 72\n"
     },
     {
      "line": 2,
      "vars": {
       "line": "\"Ben,64\n\"",
       "parts": "[\"Ben\", \"64\"]",
       "name": "\"Ben\"",
       "score": "64"
      },
      "out": "Ava scored 72\nBen scored 64\n"
     },
     {
      "line": 3,
      "vars": {
       "line": "\"Cal,88\n\"",
       "parts": "[\"Ben\", \"64\"]",
       "name": "\"Ben\"",
       "score": "64"
      },
      "out": "Ava scored 72\nBen scored 64\n"
     },
     {
      "line": 4,
      "vars": {
       "line": "\"Cal,88\n\"",
       "parts": "[\"Cal\", \"88\"]",
       "name": "\"Ben\"",
       "score": "64"
      },
      "out": "Ava scored 72\nBen scored 64\n"
     },
     {
      "line": 5,
      "vars": {
       "line": "\"Cal,88\n\"",
       "parts": "[\"Cal\", \"88\"]",
       "name": "\"Cal\"",
       "score": "64"
      },
      "out": "Ava scored 72\nBen scored 64\n"
     },
     {
      "line": 6,
      "vars": {
       "line": "\"Cal,88\n\"",
       "parts": "[\"Cal\", \"88\"]",
       "name": "\"Cal\"",
       "score": "88"
      },
      "out": "Ava scored 72\nBen scored 64\n"
     },
     {
      "line": 2,
      "vars": {
       "line": "\"Cal,88\n\"",
       "parts": "[\"Cal\", \"88\"]",
       "name": "\"Cal\"",
       "score": "88"
      },
      "out": "Ava scored 72\nBen scored 64\nCal scored 88\n"
     },
     {
      "line": 7,
      "vars": {
       "line": "\"Cal,88\n\"",
       "parts": "[\"Cal\", \"88\"]",
       "name": "\"Cal\"",
       "score": "88"
      },
      "out": "Ava scored 72\nBen scored 64\nCal scored 88\n"
     },
     {
      "line": 0,
      "vars": {
       "line": "\"Cal,88\n\"",
       "parts": "[\"Cal\", \"88\"]",
       "name": "\"Cal\"",
       "score": "88"
      },
      "out": "Ava scored 72\nBen scored 64\nCal scored 88\n",
      "done": true
     }
    ]
   },
   {
    "kind": "trace",
    "title": "Writing to a file",
    "intro": "Write each item followed by a newline.",
    "code": "items = [\"pen\", \"ruler\", \"glue\"]\nf = open(\"list.txt\", \"w\")\nfor item in items:\n    f.write(item + \"\\n\")\nf.close()\nprint(\"Saved\", len(items), \"items\")\n",
    "inputs": [],
    "notes": {
     "4": "write() does not add a newline, so add \"\\n\" yourself."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]"
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]"
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"pen\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"pen\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"ruler\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"ruler\""
      },
      "out": ""
     },
     {
      "line": 4,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"glue\""
      },
      "out": ""
     },
     {
      "line": 3,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"glue\""
      },
      "out": ""
     },
     {
      "line": 5,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"glue\""
      },
      "out": ""
     },
     {
      "line": 6,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"glue\""
      },
      "out": ""
     },
     {
      "line": 0,
      "vars": {
       "items": "[\"pen\", \"ruler\", \"glue\"]",
       "item": "\"glue\""
      },
      "out": "Saved 3 items\n",
      "done": true
     }
    ]
   },
   {
    "kind": "check",
    "question": "A line read from a file is `\"Bo,81\\n\"`. What does `line.strip().split(\",\")` give?",
    "options": [
     "[\"Bo\", \"81\"]",
     "[\"Bo,81\"]",
     "[\"Bo\", 81]",
     "\"Bo 81\""
    ],
    "answer": 0,
    "hints": [
     "strip() removes the newline first.",
     "split(\",\") cuts at each comma and gives a list of strings."
    ],
    "explain": "You get a list of two strings: [\"Bo\", \"81\"]."
   },
   {
    "kind": "check",
    "question": "Which mode adds to the end of an existing file?",
    "options": [
     "\"r\"",
     "\"w\"",
     "\"a\"",
     "\"x\""
    ],
    "answer": 2,
    "hints": [
     "Think of the word 'append'.",
     "w would replace the whole file."
    ],
    "explain": "\"a\" appends to the end."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2fi-1",
    "title": "Total from a file",
    "prompt": "`sales.txt` has one number on each line. Read the file and print `Total: ` and the total.",
    "starter": "f = open(\"sales.txt\", \"r\")\n",
    "solution": "f = open(\"sales.txt\", \"r\")\ntotal = 0\nfor line in f:\n    total = total + int(line.strip())\nf.close()\nprint(\"Total:\", total)\n",
    "tests": [
     {
      "inputs": [],
      "expected": "Total: 500\n"
     }
    ],
    "hints": [
     "Loop through the lines and convert each to int.",
     "total = total + int(line.strip())"
    ],
    "files": {
     "sales.txt": "120\n45\n300\n35\n"
    }
   },
   {
    "kind": "code",
    "id": "p2fi-2",
    "title": "Pass list",
    "prompt": "`results.txt` has `name,mark` on each line. Print the names of students with a mark of 50 or more, one per line.",
    "starter": "\n",
    "solution": "f = open(\"results.txt\", \"r\")\nfor line in f:\n    parts = line.strip().split(\",\")\n    if int(parts[1]) >= 50:\n        print(parts[0])\nf.close()\n",
    "tests": [
     {
      "inputs": [],
      "expected": "Ava\nCal\nEli\n"
     }
    ],
    "hints": [
     "Split each line with split(\",\").",
     "Convert parts[1] to int before comparing."
    ],
    "files": {
     "results.txt": "Ava,72\nBen,44\nCal,50\nDev,38\nEli,91\n"
    }
   }
  ],
  "quiz": [
   {
    "q": "Which mode opens a file for reading?",
    "options": [
     "\"w\"",
     "\"r\"",
     "\"a\"",
     "\"read\""
    ],
    "answer": 1,
    "explain": "\"r\" is read."
   },
   {
    "q": "What does \"w\" do to an existing file?",
    "options": [
     "Adds to the end",
     "Replaces its contents",
     "Reads it",
     "Nothing"
    ],
    "answer": 1,
    "explain": "Write mode starts the file again."
   },
   {
    "q": "What does \"a,b,c\".split(\",\") return?",
    "options": [
     "\"abc\"",
     "[\"a\", \"b\", \"c\"]",
     "[\"a,b,c\"]",
     "3"
    ],
    "answer": 1,
    "explain": "A list of the parts."
   },
   {
    "q": "Why use strip() on a line read from a file?",
    "options": [
     "To sort it",
     "To remove the newline at the end",
     "To make it upper case",
     "To split it"
    ],
    "answer": 1,
    "explain": "Each line ends with a newline character."
   },
   {
    "q": "Why save data to a file?",
    "options": [
     "It runs faster",
     "It is kept after the program ends",
     "Python needs it",
     "To print it"
    ],
    "answer": 1,
    "explain": "Files store data permanently."
   }
  ]
 },
 {
  "id": "p2-validation-testing",
  "paper": "Paper 2",
  "spec": "Topics 1-2",
  "title": "Validation and testing",
  "summary": "Check input with validation, and choose normal, boundary and erroneous test data.",
  "minutes": 20,
  "steps": [
   {
    "kind": "explain",
    "title": "Validation checks",
    "body": "**Validation** checks that data is sensible before it is used. It cannot check the data is *correct*.\n\n- **Range check** - between limits, e.g. 0 to 100\n- **Length check** - e.g. a password has at least 8 characters\n- **Presence check** - something was entered\n- **Type check** - e.g. a whole number was entered\n- **Lookup check** - the value is one from a list of allowed values, e.g. \"Y\" or \"N\"\n- **Format check** - the data matches a pattern, e.g. a date as DD/MM/YYYY"
   },
   {
    "kind": "trace",
    "title": "Length and presence check",
    "intro": "The user types nothing, then 'abc', then 'secure99'.",
    "code": "pw = input(\"Password: \")\nwhile len(pw) < 8:\n    if pw == \"\":\n        print(\"You must enter a password\")\n    else:\n        print(\"Too short\")\n    pw = input(\"Password: \")\nprint(\"OK\")\n",
    "inputs": [
     "",
     "abc",
     "secure99"
    ],
    "notes": {
     "2": "Length check: fewer than 8 characters is rejected.",
     "3": "Presence check: nothing was typed."
    },
    "predict": null,
    "files": {},
    "frames": [
     {
      "line": 1,
      "vars": {},
      "out": ""
     },
     {
      "line": 2,
      "vars": {
       "pw": "\"\""
      },
      "out": "Password: \n"
     },
     {
      "line": 3,
      "vars": {
       "pw": "\"\""
      },
      "out": "Password: \n"
     },
     {
      "line": 4,
      "vars": {
       "pw": "\"\""
      },
      "out": "Password: \n"
     },
     {
      "line": 7,
      "vars": {
       "pw": "\"\""
      },
      "out": "Password: \nYou must enter a password\n"
     },
     {
      "line": 2,
      "vars": {
       "pw": "\"abc\""
      },
      "out": "Password: \nYou must enter a password\nPassword: abc\n"
     },
     {
      "line": 3,
      "vars": {
       "pw": "\"abc\""
      },
      "out": "Password: \nYou must enter a password\nPassword: abc\n"
     },
     {
      "line": 6,
      "vars": {
       "pw": "\"abc\""
      },
      "out": "Password: \nYou must enter a password\nPassword: abc\n"
     },
     {
      "line": 7,
      "vars": {
       "pw": "\"abc\""
      },
      "out": "Password: \nYou must enter a password\nPassword: abc\nToo short\n"
     },
     {
      "line": 2,
      "vars": {
       "pw": "\"secure99\""
      },
      "out": "Password: \nYou must enter a password\nPassword: abc\nToo short\nPassword: secure99\n"
     },
     {
      "line": 8,
      "vars": {
       "pw": "\"secure99\""
      },
      "out": "Password: \nYou must enter a password\nPassword: abc\nToo short\nPassword: secure99\n"
     },
     {
      "line": 0,
      "vars": {
       "pw": "\"secure99\""
      },
      "out": "Password: \nYou must enter a password\nPassword: abc\nToo short\nPassword: secure99\nOK\n",
      "done": true
     }
    ]
   },
   {
    "kind": "explain",
    "title": "Choosing test data",
    "body": "For a mark that must be **0 to 100**:\n\n- **Normal** data - typical valid values: 45, 72\n- **Boundary** data - at the edges of the valid range: 0 and 100 (and just outside: -1 and 101)\n- **Erroneous** data - invalid and should be rejected: -20, 150, \"abc\"\n\nA **test plan** lists the test data, the expected result and the actual result."
   },
   {
    "kind": "check",
    "question": "A program accepts ages 11 to 18. Which is boundary data?",
    "options": [
     "15",
     "18",
     "25",
     "\"ten\""
    ],
    "answer": 1,
    "hints": [
     "Boundary values are at the edge of the valid range.",
     "Which value is one of the limits?"
    ],
    "explain": "18 is the top limit, so it is boundary data."
   },
   {
    "kind": "check",
    "question": "Which check makes sure a field is not left empty?",
    "options": [
     "Range check",
     "Presence check",
     "Length check",
     "Type check"
    ],
    "answer": 1,
    "hints": [
     "Is something present?",
     "It checks that data exists."
    ],
    "explain": "A presence check."
   }
  ],
  "practice": [
   {
    "kind": "code",
    "id": "p2vt-1",
    "title": "Validated mark",
    "prompt": "Keep asking `Mark: ` until a value from 0 to 100 is entered. Print `Invalid` for each rejected value, then `Saved` and the mark.",
    "starter": "\n",
    "solution": "mark = int(input(\"Mark: \"))\nwhile mark < 0 or mark > 100:\n    print(\"Invalid\")\n    mark = int(input(\"Mark: \"))\nprint(\"Saved\", mark)\n",
    "tests": [
     {
      "inputs": [
       "101",
       "-1",
       "100"
      ],
      "expected": "Invalid\nInvalid\nSaved 100\n"
     },
     {
      "inputs": [
       "0"
      ],
      "expected": "Saved 0\n"
     }
    ],
    "hints": [
     "Use a while loop with or.",
     "while mark < 0 or mark > 100:"
    ],
    "files": {}
   },
   {
    "kind": "answer",
    "id": "p2vt-2",
    "title": "Test data",
    "prompt": "A program accepts a quantity from 1 to 20. Give the two **boundary** values inside the valid range, separated by a comma.",
    "accept": [
     "1,20",
     "1, 20",
     "20,1",
     "20, 1",
     "1 and 20",
     "20 and 1",
     "1 20",
     "20 1"
    ],
    "hints": [
     "Boundary values are the edges of the range.",
     "The smallest and largest valid values."
    ],
    "solution": "1 and 20 (the values just outside, 0 and 21, are also boundary tests)."
   }
  ],
  "quiz": [
   {
    "q": "What does validation check?",
    "options": [
     "That data is correct",
     "That data is sensible/allowed",
     "That data is encrypted",
     "That data is sorted"
    ],
    "answer": 1,
    "explain": "Validation cannot prove data is correct."
   },
   {
    "q": "Password at least 8 characters - which check?",
    "options": [
     "Range",
     "Length",
     "Presence",
     "Lookup"
    ],
    "answer": 1,
    "explain": "It checks the number of characters."
   },
   {
    "q": "Valid range 1-50. Which is erroneous data?",
    "options": [
     "1",
     "25",
     "50",
     "75"
    ],
    "answer": 3,
    "explain": "75 is outside the range."
   },
   {
    "q": "Valid range 1-50. Which is normal data?",
    "options": [
     "0",
     "1",
     "30",
     "51"
    ],
    "answer": 2,
    "explain": "A typical value inside the range."
   },
   {
    "q": "Which loop is used to keep asking until input is valid?",
    "options": [
     "for",
     "while",
     "if",
     "def"
    ],
    "answer": 1,
    "explain": "Unknown number of attempts, so while."
   }
  ]
 }
] as unknown as LearnLesson[];

export const LEARN_LESSON_MAP: Record<string, LearnLesson> = Object.fromEntries(LEARN_LESSONS.map((l) => [l.id, l]));
