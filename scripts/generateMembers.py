import json
from collections import defaultdict

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

# Names from the prompt
names_sample = [
  ("A K M Ataur Rahman", 65, "HSC", "Service", 25000, 4),
  ("Abdullah Youshuf Mohd", 68, "Masters", "Retired", 10000, 2),
  ("Alaiuddin Ahmed", 57, "SSC", "Business", 2000, 6),
  ("Abdur Rob Choudhury", 79, "Masters", "Retired", 5000, 3),
  ("Abdur Rouf Khan", 70, "HSC", "Pensioner", 13625, 4),
  ("Bashir Uddin Ahmed", 63, "Engineer", "Service", 60000, 4),
  ("Dr Sabir Ahmad", 59, "MA", "Service", 55333, 5),
  ("Dr Salim Mohammad Shahjahan", 69, "Doctor", "Business", 300000, 1),
  ("Maksud Ahmad Roman", 46, "Masters", "Service", 220000, 2),
  ("Md Abdul Karim", 64, "Degree", "Pensioner", 25000, 3),
  ("Mohammad Fazlur Rahman", 79, "Degree", "Retired", 20000, 2),
  ("Syed Reyaz Ahmed", 74, "Masters", "Retired", 45000, 3),
  ("Md. Mohiuddin Ahmed", 64, "Masters", "Retired", 2000, 5),
  ("Enamul Haque Rasel", 47, "Masters", "Service", 60000, 5),
  ("Mohammad Yeamin Natai", 44, "Masters", "Service", 215000, 4),
  ("Maolana Ahmed Sadek Mahmud", 76, "Maolana", "Retired", 10500, 4),
  ("Md Lutfor Rahman Dhali", 52, "HSC", "Business", 25000, 4),
  ("Dr. Abdur Rashid", 96, "Doctor", "Retired", 1000, 1),
  ("Muhammad Muhibur Rahman", 70, "SSC", "Retired", 14000, 4),
  ("Dr. Mojahid Uddin Ahmad", 78, "PhD", "Professor", 24000, 2),
  ("Engr. Hafizur rahman", 63, "Doctor", "Doctor", 44000, 2),
  ("Mozammel Haque", 53, "Kamil", "Moallem", 22000, 3),
  ("Abdul Ajiz", 74, "5th", "Business", 2000, 2),
  ("Abdul Awal Master", 72, "B.COM", "Retired", 22000, 2),
  ("Ehsanur Rahman", 59, "HSC", "Service", 20000, 4),
  ("Mahbubur Rahman", 50, "L.L.B", "Law", 9000, 6),
  ("DR. Amin Ahmad", 51, "I.COM", "Business", 35000, 5),
  ("Yaqub Laskar", 59, "SSC", "SERVICE", 14000, 3),
  ("Alhaj Nesar Ahmad", 53, "HSC", "BUSINESS", 180000, 5),
  ("M Arifuzzaman", 56, "MBA", "SERVICE", 60000, 5),
  ("Raza Rizwan Ahmad", 50, "BSC", "SERVICE", 170000, 4),
  ("SM Nosrullah", 72, "BA", "Service", 25000, 2),
  ("DR. Rejaul Karim", 59, "HSC", "Business", 16000, 6),
  ("Maolana Bashirur Rahman", 59, "Sahed P", "Murubbi", 25000, 3),
  ("Khondokar Mahbubul Islam", 64, "BA", "Retired", 60000, 4),
  ("Dr. Mahfuzar Rahman", 58, "MBBS", "Retired", 60000, 3),
  ("Md. Abdur Razzaq", 67, "SSC", "Service", 84000, 4),
  ("Md. Ahsan Jamil", 61, "BA", "Service", 125000, 4),
  ("Ahmad Mollah", 50, "BA", "Business", 35000, 6),
  ("Mojibar Rahman", 70, "HSC", "Retired", 14000, 2),
  ("Md. Mamun Or Rasshid", 52, "HSC", "Service", 48000, 5),
  ("Md. Haydar Ali", 52, "SSC", "Business", 6000, 3),
  ("Mawlana Abu Bakar Siddik", 76, "Kamil", "Business", 12000, 2),
  ("Md. Lutfar Rahman Master", 59, "MA", "Service", 39000, 4),
  ("Md. Nazrul Islam", 76, "SSC", "Business", 12000, 2),
  ("Muhammad Ismail", 53, "LLB", "Advocate", 200000, 4),
  ("Hafizur Rahman", 42, "HSC", "Business", 15000, 4),
  ("Tofazzol Hoassain", 68, "BA", "Service", 32000, 5),
  ("Anwar Ahmad Choudhury", 49, "BA", "Service", 20000, 4),
  ("Md. Iqbal Choudhury", 57, "BSC", "Service", 80000, 4),
  ("Md. Samsur Rahman", 46, "BCOM", "Business", 120000, 4),
  ("Abdullah Ahamed", 53, "MA", "Service", 100000, 5),
  ("Ishak Ali Mollah", 68, "SSC", "Service", 10000, 10),
  ("Dr. Abdullah Shams Bin Tariq", 49, "PhD", "Service", 120000, 5),
  ("Dr. Kamrullah Bin Tariq", 44, "PhD", "Service", 100000, 3),
  ("GM Siraj Uddin", 61, "BCOM", "Service", 150000, 4),
  ("Alhaj Md. Unus Ali", 84, "BA", "Retired", 15000, 2),
  ("Md. Abdus Sattar", 70, "BSC", "Retired", 9000, 6)
]

members = []
sl_counter = 1

# Generate records covering every region and majlis with real structure
import random
random.seed(42)

for region, majlises in regions_data.items():
    for majlis in majlises:
        # Determine number of members in this majlis (between 3 and 10)
        count = random.randint(4, 9)
        for j in range(count):
            base = names_sample[sl_counter % len(names_sample)]
            # Add variation to name
            name = base[0] if j == 0 else f"{base[0]} ({j+1})"
            age = max(40, min(95, base[1] + random.randint(-4, 6)))
            edu = base[2] if random.random() > 0.3 else random.choice(['SSC', 'HSC', 'BA', 'Masters', '8th', 'Degree'])
            occ = base[3] if random.random() > 0.3 else random.choice(['Business', 'Service', 'Farmer', 'Retired', 'Labour'])
            income = max(1000, int(base[4] * random.uniform(0.6, 1.4) / 100) * 100)
            fam = max(1, min(12, base[5] + random.randint(-1, 2)))
            
            salat = random.random() > 0.15
            salat_m = salat and (random.random() > 0.3)
            jummah = random.random() > 0.1
            nazira = random.random() > 0.12
            tilawat = nazira and (random.random() > 0.25)
            q_mean = tilawat and (random.random() > 0.45)
            tafseer = q_mean and (random.random() > 0.5)
            books = random.random() > 0.3
            tableeq = random.random() > 0.4
            mta = random.random() > 0.2
            khutba = mta and (random.random() > 0.25)
            chanda_aam = random.random() > 0.08
            musi = random.random() > 0.55
            tj = random.random() > 0.1
            wj = random.random() > 0.1
            majlis_c = random.random() > 0.12
            ijtema_c = random.random() > 0.15
            bulletin_c = random.random() > 0.25
            
            member = {
                "id": f"mem-{sl_counter}",
                "masterSlNo": sl_counter,
                "region": region,
                "majlis": majlis,
                "name": name,
                "age": age,
                "baiyatDateOrBirth": "By Birth" if random.random() > 0.25 else f"{random.randint(1965, 2015)}",
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

with open('src/data/initialMembers.json', 'w', encoding='utf-8') as f:
    json.dump(members, f, ensure_ascii=False, indent=2)

print(f"Generated {len(members)} records across {len(regions_data)} regions.")
