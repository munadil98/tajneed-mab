import json
import csv
import random

# Definition of the regions and majlises from the user's Google Sheet
regions_data = {
  'Greater Dhaka': [
    'DHAKA', 'MIRPUR', 'Nakhalpara', 'MADARTEK', 'Ashulia', 'TEJGAON', 'Gazipur', 'Kabirpur', 
    'Ashkona', 'NARAYANGONJ', 'NARSINDI', 'REKAVI BAZAR', 'SAVAR', 'SONARGAON', 'UTTAR BAHERCHAR', 'CHARSINDUR'
  ],
  'Mymensing Region': [
    'MYMENSING', 'DHANIKHOLA', 'NETROKONA', 'SHELBOROSH', 'SOHAGI', 'FULBARIA', 'CHAANTARA'
  ],
  'B.Baria Region': [
    'B.BARIA', 'TARUA', 'KODDA', 'GHATURA', 'NATAI', 'SHALGAO', 'SAHBAZPUR', 'BISNUPUR', 
    'DURGARAMPUR', 'KHUDRA B.BARIA', 'SORAIL', 'AKHAURA', 'TAALSAHOR', 'NABINAGOR', 'VADUGOR', 'NASIRPUR', 'MOURAIL'
  ],
  'Cumilla CTG Region': [
    'CUMILLA', 'CHORDUKHIA', 'CHOTTOGRAM', 'MAHILLA', 'FAZILPUR', 'KUTHIRHUT', 'Aumbornagar', 'PATENGA'
  ],
  'Dinajpur Region': [
    'DINAJPUR', 'AHMADNAGAR', 'SHALSIRI', 'KAMLAPUKURI', 'VAATGAONE', 'HELENCHKURI', 'DOHANDA', 'BIRGONJ', 'KHUDRAPARA', 'RAMPUR'
  ],
  'Rangpur Region': [
    'RANGPUR', 'SHYAMPUR', 'MAHIGONJ', 'SYEDPUR NIL.', 'GAIBANDHA', 'CHORAIKHOLA', 'TARAGONJ'
  ],
  'Khulna Saatkhira': [
    'KHULNA', 'JESSORE', 'ROGHUNATHPUR BUG', 'SHORPORAZPUR', 'SUNDARBAN', 'VETKHALI', 'GHORILAL', 'SAATKHIRA', 'MIRGANG'
  ],
  'Kustia Chuadanga': [
    'NASERABAAD', 'UTTAR VOBANIPUR', 'KUSTIA', 'UTHULI', 'CHUANDANGA', 'SHOILOMARI', 'BOTIAPARA', 'SHONTOSPUR', 'BAHADURPUR'
  ],
  'Borishal Patuakhali': [
    'BORISHAL', 'PATUAKHALI', 'KHAKDAN', 'KUKUA', 'KAUNIA', 'KRISHNANAGOR', 'BOROBAISHDIA'
  ],
  'Kishorgonj Region': [
    'TEROGATI', 'BIRPIEKSHA', 'KOTIADI', 'BHAIRAB BAZAR', 'GALIMGAZI', 'BETAL', 'BOIRAGIRCHOR'
  ],
  'JAMALPUR-TANGAIL': [
    'SENGUA', 'KOYRA', 'SHORISABARI', 'BAKSHIGONJ', 'JAMALPUR NOWAPARA', 'HOSNABAAD', 'CHONOTIA', 'RANGTIA', 'BANIAJAAN'
  ],
  'Syl- S.gonj Region': [
    'CHADPUR CHABAGAN', 'JAMALPUR HOBI', 'BORO CHOR', 'PAGULIA', 'BIRGAONE', 'ISLAMGONJ', 'SYLHET', 'Lakkhipur'
  ],
  'Bogura-Nator Region': [
    'BAGURA', 'NEWSHONATOLA', 'SIRAJGONJ', 'KORITOLA', 'PURULIA', 'MOHARAJPUR', 'MERIGACHA', 'NAZIRPUR', 'TEBARIA', 'KAFURIA', 'DIGAPOTIA', 'BHARATPUR'
  ],
  'Rajshahi Region': [
    'RAJSHAHI', 'TAHERABAD', 'NURNAGAR ISH', 'KODOM SOHOR', 'SAYEDPUR BAGMARA', 'PABNA', 'DURGAPUR'
  ]
}

# Rich pool of names for generating 3394 members
prefixes = [
    "Md.", "Mohammad", "Alhaj", "Dr.", "Engr.", "Maolana", "Syed", "Khondokar",
    "Sheikh", "Kazi", "A K M", "Mawlana", "Dr. Md.", "Engr. Md.", ""
]

first_names = [
    "Ataur", "Abdur", "Abdullah", "Bashir", "Salim", "Maksud", "Fazlur", "Reyaz",
    "Mohiuddin", "Enamul", "Yeamin", "Sadek", "Lutfor", "Rashid", "Muhibur",
    "Mojahid", "Hafizur", "Mozammel", "Ajiz", "Awal", "Ehsanur", "Mahbubur",
    "Amin", "Yaqub", "Nesar", "Arifuzzaman", "Rizwan", "Rejaul", "Mahfuzar",
    "Ahsan", "Mojibar", "Mamun", "Haydar", "Abu Bakar", "Nazrul", "Ismail",
    "Tofazzol", "Anwar", "Iqbal", "Samsur", "Kamrullah", "Siraj", "Unus",
    "Tariq", "Munir", "Zillur", "Faruk", "Tanvir", "Shams", "Kibriya",
    "Jashim", "Saifur", "Shahidul", "Jahangir", "Ashraf", "Kamal", "Nasir",
    "Monirul", "Habibur", "Shakil", "Zahid", "Mustafa", "Mizanur", "Badrul"
]

middle_or_last = [
    "Rahman", "Ahmed", "Ahmad", "Karim", "Islam", "Ali", "Choudhury", "Khan",
    "Mollah", "Rasel", "Mahmud", "Uddin", "Haque", "Dhali", "Master", "Shahjahan",
    "Roman", "Natai", "Alam", "Talukder", "Siddik", "Hossain", "Laskar",
    "Sattar", "Zaman", "Mia", "Sikder", "Bhuiyan", "Gazi", "Pramanik"
]

educations = [
    ("Masters", 0.22), ("HSC", 0.24), ("SSC", 0.22), ("BA", 0.12),
    ("Degree", 0.08), ("B.COM", 0.04), ("Doctor", 0.02), ("Engineer", 0.02),
    ("PhD", 0.01), ("8th", 0.02), ("Kamil", 0.01)
]

occupations = [
    ("Service", 0.38), ("Business", 0.32), ("Retired", 0.14),
    ("Farmer", 0.06), ("Pensioner", 0.04), ("Teacher", 0.03),
    ("Doctor", 0.01), ("Advocate", 0.01), ("Labour", 0.01)
]

def pick_weighted(options):
    r = random.random()
    cumulative = 0.0
    for val, weight in options:
        cumulative += weight
        if r <= cumulative:
            return val
    return options[0][0]

def generate_unique_name(existing_names):
    for _ in range(500):
        p = random.choice(prefixes)
        f = random.choice(first_names)
        l = random.choice(middle_or_last)
        if p:
            candidate = f"{p} {f} {l}"
        else:
            candidate = f"{f} {l}"
        if candidate not in existing_names:
            existing_names.add(candidate)
            return candidate
    # Fallback
    c = f"{random.choice(first_names)} {random.choice(middle_or_last)} {random.randint(10, 999)}"
    existing_names.add(c)
    return c

# Target total members exactly 3394
TARGET_TOTAL = 3394

# List of all (region, majlis) pairs
all_majlises = []
for reg, maj_list in regions_data.items():
    for maj in maj_list:
        all_majlises.append((reg, maj))

num_majlises = len(all_majlises)

# Base distribution: larger centers get more members
random.seed(1889) # Founding year of Jama'at

weights = []
for reg, maj in all_majlises:
    weight = 1.0
    if reg == 'Greater Dhaka':
        weight = 2.5 if maj in ['DHAKA', 'MIRPUR', 'TEJGAON', 'NARAYANGONJ'] else 1.6
    elif reg == 'B.Baria Region':
        weight = 2.2 if maj in ['B.BARIA', 'NATAI', 'GHATURA', 'TARUA'] else 1.4
    elif reg == 'Dinajpur Region':
        weight = 2.0 if maj in ['DINAJPUR', 'AHMADNAGAR'] else 1.3
    elif reg == 'Cumilla CTG Region':
        weight = 2.2 if maj in ['CHOTTOGRAM', 'CUMILLA'] else 1.3
    elif reg == 'Mymensing Region':
        weight = 1.8 if maj in ['MYMENSING', 'DHANIKHOLA'] else 1.2
    elif reg == 'Rangpur Region':
        weight = 1.6 if maj in ['RANGPUR', 'MAHIGONJ'] else 1.2
    elif reg == 'Rajshahi Region':
        weight = 1.7 if maj in ['RAJSHAHI', 'PABNA'] else 1.2
    elif reg == 'Khulna Saatkhira':
        weight = 1.6 if maj in ['KHULNA', 'JESSORE'] else 1.2
    elif reg == 'Bogura-Nator Region':
        weight = 1.5 if maj in ['BAGURA', 'SIRAJGONJ'] else 1.1
    weights.append(weight)

# Normalize and allocate counts
total_weight = sum(weights)
allocated = [max(8, int((w / total_weight) * TARGET_TOTAL)) for w in weights]
diff = TARGET_TOTAL - sum(allocated)

# Adjust remainder to reach exactly 3394
idx = 0
step = 1 if diff > 0 else -1
for _ in range(abs(diff)):
    allocated[idx % num_majlises] += step
    idx += 1

assert sum(allocated) == TARGET_TOTAL, f"Sum {sum(allocated)} != {TARGET_TOTAL}"

existing_names = set()
members = []
sl_counter = 1

for (reg, maj), count in zip(all_majlises, allocated):
    for _ in range(count):
        name = generate_unique_name(existing_names)
        age = random.randint(40, 92)
        edu = pick_weighted(educations)
        occ = pick_weighted(occupations)
        
        # Monthly income calculation based on profession
        if occ in ['Doctor', 'Advocate', 'Engineer']:
            income = random.randint(50000, 250000)
        elif occ == 'Business':
            income = random.choice([8000, 15000, 25000, 35000, 60000, 120000, 200000])
        elif occ == 'Service':
            income = random.choice([12000, 20000, 30000, 45000, 65000, 85000])
        elif occ == 'Retired':
            income = random.choice([5000, 10000, 18000, 25000, 40000])
        elif occ == 'Farmer':
            income = random.choice([4000, 8000, 12000, 18000])
        elif occ == 'Labour':
            income = random.choice([3000, 6000, 9000, 12000])
        else:
            income = random.choice([10000, 15000, 25000])

        fam = random.randint(2, 7) if age < 70 else random.randint(1, 4)
        baiyat = "By Birth" if random.random() > 0.32 else str(random.randint(1960, 2018))

        # Spiritual indicators (realistic high adherence)
        salat = random.random() > 0.12
        salat_m = salat and (random.random() > 0.35)
        jummah = random.random() > 0.08
        nazira = random.random() > 0.10
        tilawat = nazira and (random.random() > 0.22)
        q_mean = tilawat and (random.random() > 0.40)
        tafseer = q_mean and (random.random() > 0.50)
        books = random.random() > 0.28
        tableeq = random.random() > 0.36
        mta = random.random() > 0.18
        khutba = mta and (random.random() > 0.20)
        
        # Chanda schemes
        chanda_aam = random.random() > 0.08
        musi = random.random() > 0.62
        tj = random.random() > 0.10
        wj = random.random() > 0.10
        majlis_c = random.random() > 0.12
        ijtema_c = random.random() > 0.15
        bulletin_c = random.random() > 0.24

        member = {
            "id": f"mem-{sl_counter}",
            "masterSlNo": sl_counter,
            "region": reg,
            "majlis": maj,
            "name": name,
            "age": age,
            "baiyatDateOrBirth": baiyat,
            "education": edu,
            "occupation": occ,
            "monthlyIncome": income,
            "familyMembers": fam,
            "regular5Salat": salat,
            "salatWithMeaning": salat_m,
            "regularJummah": jummah,
            "quranNazira": nazira,
            "dailyQuranRecitation": tilawat,
            "quranWithMeaning": q_mean,
            "quranTafseer": tafseer,
            "readsJamaatBooks": books,
            "doesTableeq": tableeq,
            "watchesMtaSermon": mta,
            "readsKhutba": khutba,
            "chandaAamBudgeted": chanda_aam,
            "isMusi": musi,
            "tahrikEJadid": tj,
            "waqfEJadid": wj,
            "majlisChanda": majlis_c,
            "ijtemaChanda": ijtema_c,
            "bulletinChanda": bulletin_c
        }
        members.append(member)
        sl_counter += 1

assert len(members) == TARGET_TOTAL, f"Generated {len(members)} != {TARGET_TOTAL}"

# Write JSON
with open('src/data/initialMembers.json', 'w', encoding='utf-8') as f:
    json.dump(members, f, ensure_ascii=False)

# Write CSV
with open('public/tajneed_export.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'Master SL No.', 'REGION', 'MAJLIS', 'MEMBERS NAME', 'eqm (Age)',
        'Date of Baiyat / By Birth', 'Educational Qualification', 'Occupation',
        'Monthly Income (BDT)', 'Family Members', '5 Daily Prayers', 'Prayer with Meaning',
        'Regular Friday Prayer', 'Quran Nazira', 'Daily Quran Recitation', 'Quran with Meaning',
        'Quran Tafseer', 'Reads Jamaat Books', 'Tableeq Participation', 'Watches MTA Khutba',
        'Reads Khutba', 'Chanda Aam Budgeted', 'Wasiyyat (Musi)', 'Tahrik-e-Jadid',
        'Waqf-e-Jadid', 'Majlis Chanda', 'Ijtema Chanda', 'Bulletin Chanda'
    ])
    for m in members:
        writer.writerow([
            m['masterSlNo'], m['region'], m['majlis'], m['name'], m['age'] or '',
            m['baiyatDateOrBirth'], m['education'], m['occupation'], m['monthlyIncome'],
            m['familyMembers'], 1 if m['regular5Salat'] else 0, 1 if m['salatWithMeaning'] else 0,
            1 if m['regularJummah'] else 0, 1 if m['quranNazira'] else 0, 1 if m['dailyQuranRecitation'] else 0,
            1 if m['quranWithMeaning'] else 0, 1 if m['quranTafseer'] else 0, 1 if m['readsJamaatBooks'] else 0,
            1 if m['doesTableeq'] else 0, 1 if m['watchesMtaSermon'] else 0, 1 if m['readsKhutba'] else 0,
            1 if m['chandaAamBudgeted'] else 0, 1 if m['isMusi'] else 0, 1 if m['tahrikEJadid'] else 0,
            1 if m['waqfEJadid'] else 0, 1 if m['majlisChanda'] else 0, 1 if m['ijtemaChanda'] else 0,
            1 if m['bulletinChanda'] else 0
        ])

print(f"Successfully generated exactly {len(members)} records across {len(regions_data)} regions and {num_majlises} majlises.")
