type Language = {
  tag: string
  name: string
  originalName: string
  locale: string
}

export const languages: Language[] = JSON.parse(`[{"tag":"zu","name":"isiZulu","originalName":"isiZulu","locale":"zu-ZA"},{"tag":"zh","name":"Chinese","originalName":"中文","locale":"zh-CHS"},{"tag":"yo","name":"Yoruba","originalName":"Yoruba","locale":"yo-NG"},{"tag":"xh","name":"isiXhosa","originalName":"isiXhosa","locale":"xh-ZA"},{"tag":"wo","name":"Wolof","originalName":"Wolof","locale":"wo-SN"},{"tag":"vi","name":"Vietnamese","originalName":"Tiếng Việt","locale":"vi"},{"tag":"uz","name":"Uzbek","originalName":"U'zbek","locale":"uz"},{"tag":"ur","name":"Urdu","originalName":"اُردو","locale":"ur"},{"tag":"uk","name":"Ukrainian","originalName":"україньска","locale":"uk"},{"tag":"ug","name":"Uyghur","originalName":"ئۇيغۇرچە","locale":"ug-CN"},{"tag":"tzm","name":"Tamazight","originalName":"Tamazight","locale":"tzm-Latn-DZ"},{"tag":"tt","name":"Tatar","originalName":"Татар","locale":"tt"},{"tag":"tr","name":"Turkish","originalName":"Türkçe","locale":"tr"},{"tag":"tn","name":"Setswana","originalName":"Setswana","locale":"tn-ZA"},{"tag":"tk","name":"Turkmen","originalName":"türkmençe","locale":"tk-TM"},{"tag":"th","name":"Thai","originalName":"ไทย","locale":"th"},{"tag":"tg","name":"Tajik","originalName":"Тоҷикӣ","locale":"tg-Cyrl-TJ"},{"tag":"te","name":"Telugu","originalName":"తెలుగు","locale":"te"},{"tag":"ta","name":"Tamil","originalName":"தமிழ்","locale":"ta"},{"tag":"syr","name":"Syriac","originalName":"ܣܘܪܝܝܐ","locale":"syr"},{"tag":"sw","name":"Kiswahili","originalName":"Kiswahili","locale":"sw"},{"tag":"sv","name":"Swedish","originalName":"svenska","locale":"sv"},{"tag":"sr","name":"Serbian","originalName":"srpski","locale":"sr"},{"tag":"sq","name":"Albanian","originalName":"shqipe","locale":"sq"},{"tag":"sms","name":"Sami","originalName":"sääm´ǩiõll","locale":"sms-FI"},{"tag":"smn","name":"Sami","originalName":"sämikielâ","locale":"smn-FI"},{"tag":"smj","name":"Sami","originalName":"julevusámegiella","locale":"smj-NO"},{"tag":"sma","name":"Sami","originalName":"åarjelsaemiengiele","locale":"sma-NO"},{"tag":"sl","name":"Slovenian","originalName":"slovenski","locale":"sl"},{"tag":"sk","name":"Slovak","originalName":"slovenčina","locale":"sk"},{"tag":"si","name":"Sinhala","originalName":"සිංහ","locale":"si-LK"},{"tag":"se","name":"Sami","originalName":"davvisámegiella","locale":"se-FI"},{"tag":"sah","name":"Yakut","originalName":"саха","locale":"sah-RU"},{"tag":"sa","name":"Sanskrit","originalName":"संस्कृत","locale":"sa"},{"tag":"rw","name":"Kinyarwanda","originalName":"Kinyarwanda","locale":"rw-RW"},{"tag":"ru","name":"Russian","originalName":"русский","locale":"ru"},{"tag":"ro","name":"Romanian","originalName":"română","locale":"ro"},{"tag":"rm","name":"Romansh","originalName":"Rumantsch","locale":"rm-CH"},{"tag":"quz","name":"Quechua","originalName":"runasimi","locale":"quz-BO"},{"tag":"qut","name":"K'iche","originalName":"K'iche","locale":"qut-GT"},{"tag":"pt","name":"Portuguese","originalName":"Português","locale":"pt"},{"tag":"ps","name":"Pashto","originalName":"پښتو","locale":"ps-AF"},{"tag":"prs","name":"Dari","originalName":"درى","locale":"prs-AF"},{"tag":"pl","name":"Polish","originalName":"polski","locale":"pl"},{"tag":"pa","name":"Punjabi","originalName":"ਪੰਜਾਬੀ","locale":"pa"},{"tag":"or","name":"Oriya","originalName":"ଓଡ଼ିଆ","locale":"or-IN"},{"tag":"oc","name":"Occitan","originalName":"Occitan","locale":"oc-FR"},{"tag":"nso","name":"Sesotho sa Leboa","originalName":"Sesotho sa Leboa","locale":"nso-ZA"},{"tag":"no","name":"Norwegian","originalName":"norsk","locale":"no"},{"tag":"nn","name":"Norwegian, Nynorsk","originalName":"norsk, nynorsk","locale":"nn-NO"},{"tag":"nl","name":"Dutch","originalName":"Nederlands","locale":"nl"},{"tag":"ne","name":"Nepali","originalName":"नेपाली","locale":"ne-NP"},{"tag":"nb","name":"Norwegian, Bokmål","originalName":"norsk, bokmål","locale":"nb-NO"},{"tag":"mt","name":"Maltese","originalName":"Malti","locale":"mt-MT"},{"tag":"ms","name":"Malay","originalName":"Bahasa Malaysia","locale":"ms"},{"tag":"mr","name":"Marathi","originalName":"मराठी","locale":"mr"},{"tag":"moh","name":"Mohawk","originalName":"Kanien'kéha","locale":"moh-CA"},{"tag":"mn","name":"Mongolian","originalName":"Монгол хэл","locale":"mn"},{"tag":"ml","name":"Malayalam","originalName":"മലയാളം","locale":"ml-IN"},{"tag":"mk","name":"Macedonian","originalName":"македонски јазик","locale":"mk"},{"tag":"mi","name":"Maori","originalName":"Reo Māori","locale":"mi-NZ"},{"tag":"lv","name":"Latvian","originalName":"latviešu","locale":"lv"},{"tag":"lt","name":"Lithuanian","originalName":"lietuvių","locale":"lt"},{"tag":"lo","name":"Lao","originalName":"ລາວ","locale":"lo-LA"},{"tag":"lb","name":"Luxembourgish","originalName":"Lëtzebuergesch","locale":"lb-LU"},{"tag":"ky","name":"Kyrgyz","originalName":"Кыргыз","locale":"ky"},{"tag":"kok","name":"Konkani","originalName":"कोंकणी","locale":"kok"},{"tag":"ko","name":"Korean","originalName":"한국어","locale":"ko"},{"tag":"kn","name":"Kannada","originalName":"ಕನ್ನಡ","locale":"kn"},{"tag":"km","name":"Khmer","originalName":"ខ្មែរ","locale":"km-KH"},{"tag":"kl","name":"Greenlandic","originalName":"kalaallisut","locale":"kl-GL"},{"tag":"kk","name":"Kazakh","originalName":"Қазащb","locale":"kk"},{"tag":"ka","name":"Georgian","originalName":"ქართული","locale":"ka"},{"tag":"ja","name":"Japanese","originalName":"日本語","locale":"ja"},{"tag":"iu","name":"Inuktitut","originalName":"ᐃᓄᒃᑎᑐᑦ","locale":"iu-Cans-CA"},{"tag":"it","name":"Italian","originalName":"italiano","locale":"it"},{"tag":"is","name":"Icelandic","originalName":"íslenska","locale":"is"},{"tag":"ii","name":"Yi","originalName":"ꆈꌠꁱꂷ","locale":"ii-CN"},{"tag":"ig","name":"Igbo","originalName":"Igbo","locale":"ig-NG"},{"tag":"id","name":"Indonesian","originalName":"Bahasa Indonesia","locale":"id"},{"tag":"hy","name":"Armenian","originalName":"Հայերեն","locale":"hy"},{"tag":"hu","name":"Hungarian","originalName":"magyar","locale":"hu"},{"tag":"hsb","name":"Upper Sorbian","originalName":"hornjoserbšćina","locale":"hsb-DE"},{"tag":"hr","name":"Croatian","originalName":"hrvatski","locale":"hr"},{"tag":"hi","name":"Hindi","originalName":"हिंदी","locale":"hi"},{"tag":"he","name":"Hebrew","originalName":"עברית","locale":"he"},{"tag":"ha","name":"Hausa","originalName":"Hausa","locale":"ha-Latn-NG"},{"tag":"gu","name":"Gujarati","originalName":"ગુજરાતી","locale":"gu"},{"tag":"gsw","name":"Alsatian","originalName":"Elsässisch","locale":"gsw-FR"},{"tag":"gl","name":"Galician","originalName":"galego","locale":"gl"},{"tag":"gd","name":"Scottish Gaelic","originalName":"Gàidhlig","locale":"gd-GB"},{"tag":"ga","name":"Irish","originalName":"Gaeilge","locale":"ga-IE"},{"tag":"fy","name":"Frisian","originalName":"Frysk","locale":"fy-NL"},{"tag":"fr","name":"French","originalName":"français","locale":"fr"},{"tag":"fo","name":"Faroese","originalName":"føroyskt","locale":"fo"},{"tag":"fil","name":"Filipino","originalName":"Filipino","locale":"fil-PH"},{"tag":"fi","name":"Finnish","originalName":"suomi","locale":"fi"},{"tag":"fa","name":"Persian","originalName":"فارسى","locale":"fa"},{"tag":"eu","name":"Basque","originalName":"euskara","locale":"eu"},{"tag":"et","name":"Estonian","originalName":"eesti","locale":"et"},{"tag":"es","name":"Spanish","originalName":"español","locale":"es"},{"tag":"en","name":"English","originalName":"English","locale":"en"},{"tag":"el","name":"Greek","originalName":"ελληνικά","locale":"el"},{"tag":"dv","name":"Divehi","originalName":"ދިވެހިބަސް","locale":"dv"},{"tag":"dsb","name":"Lower Sorbian","originalName":"dolnoserbšćina","locale":"dsb-DE"},{"tag":"de","name":"German","originalName":"Deutsch","locale":"de"},{"tag":"da","name":"Danish","originalName":"dansk","locale":"da"},{"tag":"cy","name":"Welsh","originalName":"Cymraeg","locale":"cy-GB"},{"tag":"cs","name":"Czech","originalName":"čeština","locale":"cs"},{"tag":"co","name":"Corsican","originalName":"Corsu","locale":"co-FR"},{"tag":"ca","name":"Catalan","originalName":"català","locale":"ca"},{"tag":"bs","name":"Bosnian","originalName":"босански","locale":"bs-Cyrl-BA"},{"tag":"br","name":"Breton","originalName":"brezhoneg","locale":"br-FR"},{"tag":"bo","name":"Tibetan","originalName":"བོད་ཡིག","locale":"bo-CN"},{"tag":"bn","name":"Bengali","originalName":"বাংলা","locale":"bn-BD"},{"tag":"bg","name":"Bulgarian","originalName":"български","locale":"bg"},{"tag":"be","name":"Belarusian","originalName":"Беларускі","locale":"be"},{"tag":"ba","name":"Bashkir","originalName":"Башҡорт","locale":"ba-RU"},{"tag":"az","name":"Azeri","originalName":"Azərbaycan­ılı","locale":"az"},{"tag":"as","name":"Assamese","originalName":"অসমীয়া","locale":"as-IN"},{"tag":"arn","name":"Mapudungun","originalName":"Mapudungun","locale":"arn-CL"},{"tag":"ar","name":"Arabic","originalName":"العربية","locale":"ar"},{"tag":"am","name":"Amharic","originalName":"አማርኛ","locale":"am-ET"},{"tag":"af","name":"Afrikaans","originalName":"Afrikaans","locale":"af"},{"tag":"iv","name":"Invariant Language","originalName":"Invariant Language","locale":""},{"tag":"Two letter","name":"English","originalName":"Native","locale":"Culture .NET"}]`)

export const languageToTag = (lang: string) => languages.find(language => language.name === lang)?.tag
export const tagToLanguage = (langTag: string) => languages.find(language => language.tag === langTag)?.name

export enum LanguageTag {
  /** isiZulu */
  ZU = 'zu',// "isiZulu",
  /** Chinese */
  ZH = 'zh',// "Chinese",
  /** Yoruba */
  YO = 'yo',// "Yoruba",
  /** isiXhosa */
  XH = 'xh',// "isiXhosa",
  /** Wolof */
  WO = 'wo',// "Wolof",
  /** Vietnamese */
  VI = 'vi',// "Vietnamese",
  /** Uzbek */
  UZ = 'uz',// "Uzbek",
  /** Urdu */
  UR = 'ur',// "Urdu",
  /** Ukrainian */
  UK = 'uk',// "Ukrainian",
  /** Uyghur */
  UG = 'ug',// "Uyghur",
  /** Tamazight */
  TZM = 'tzm',// "Tamazight",
  /** Tatar */
  TT = 'tt',// "Tatar",
  /** Turkish */
  TR = 'tr',// "Turkish",
  /** Setswana */
  TN = 'tn',// "Setswana",
  /** Turkmen */
  TK = 'tk',// "Turkmen",
  /** Thai */
  TH = 'th',// "Thai",
  /** Tajik */
  TG = 'tg',// "Tajik",
  /** Telugu */
  TE = 'te',// "Telugu",
  /** Tamil */
  TA = 'ta',// "Tamil",
  /** Syriac */
  SYR = 'syr',// "Syriac",
  /** Kiswahili */
  SW = 'sw',// "Kiswahili",
  /** Swedish */
  SV = 'sv',// "Swedish",
  /** Serbian */
  SR = 'sr',// "Serbian",
  /** Albanian */
  SQ = 'sq',// "Albanian",
  /** Sami */
  SMS = 'sms',// "Sami",
  /** Sami */
  SMN = 'smn',// "Sami",
  /** Sami */
  SMJ = 'smj',// "Sami",
  /** Sami */
  SMA = 'sma',// "Sami",
  /** Slovenian */
  SL = 'sl',// "Slovenian",
  /** Slovak */
  SK = 'sk',// "Slovak",
  /** Sinhala */
  SI = 'si',// "Sinhala",
  /** Sami */
  SE = 'se',// "Sami",
  /** Yakut */
  SAH = 'sah',// "Yakut",
  /** Sanskrit */
  SA = 'sa',// "Sanskrit",
  /** Kinyarwanda */
  RW = 'rw',// "Kinyarwanda",
  /** Russian */
  RU = 'ru',// "Russian",
  /** Romanian */
  RO = 'ro',// "Romanian",
  /** Romansh */
  RM = 'rm',// "Romansh",
  /** Quechua */
  QUZ = 'quz',// "Quechua",
  /** K */
  QUT = 'qut',// "K'iche",
  /** Portuguese */
  PT = 'pt',// "Portuguese",
  /** Pashto */
  PS = 'ps',// "Pashto",
  /** Dari */
  PRS = 'prs',// "Dari",
  /** Polish */
  PL = 'pl',// "Polish",
  /** Punjabi */
  PA = 'pa',// "Punjabi",
  /** Oriya */
  OR = 'or',// "Oriya",
  /** Occitan */
  OC = 'oc',// "Occitan",
  /** Sesotho sa Leboa */
  NSO = 'nso',// "Sesotho sa Leboa",
  /** Norwegian */
  NO = 'no',// "Norwegian",
  /** Norwegian, Nynorsk */
  NN = 'nn',// "Norwegian, Nynorsk",
  /** Dutch */
  NL = 'nl',// "Dutch",
  /** Nepali */
  NE = 'ne',// "Nepali",
  /** Norwegian, Bokmål */
  NB = 'nb',// "Norwegian, Bokmål",
  /** Maltese */
  MT = 'mt',// "Maltese",
  /** Malay */
  MS = 'ms',// "Malay",
  /** Marathi */
  MR = 'mr',// "Marathi",
  /** Mohawk */
  MOH = 'moh',// "Mohawk",
  /** Mongolian */
  MN = 'mn',// "Mongolian",
  /** Malayalam */
  ML = 'ml',// "Malayalam",
  /** Macedonian */
  MK = 'mk',// "Macedonian",
  /** Maori */
  MI = 'mi',// "Maori",
  /** Latvian */
  LV = 'lv',// "Latvian",
  /** Lithuanian */
  LT = 'lt',// "Lithuanian",
  /** Lao */
  LO = 'lo',// "Lao",
  /** Luxembourgish */
  LB = 'lb',// "Luxembourgish",
  /** Kyrgyz */
  KY = 'ky',// "Kyrgyz",
  /** Konkani */
  KOK = 'kok',// "Konkani",
  /** Korean */
  KO = 'ko',// "Korean",
  /** Kannada */
  KN = 'kn',// "Kannada",
  /** Khmer */
  KM = 'km',// "Khmer",
  /** Greenlandic */
  KL = 'kl',// "Greenlandic",
  /** Kazakh */
  KK = 'kk',// "Kazakh",
  /** Georgian */
  KA = 'ka',// "Georgian",
  /** Japanese */
  JA = 'ja',// "Japanese",
  /** Inuktitut */
  IU = 'iu',// "Inuktitut",
  /** Italian */
  IT = 'it',// "Italian",
  /** Icelandic */
  IS = 'is',// "Icelandic",
  /** Yi */
  II = 'ii',// "Yi",
  /** Igbo */
  IG = 'ig',// "Igbo",
  /** Indonesian */
  ID = 'id',// "Indonesian",
  /** Armenian */
  HY = 'hy',// "Armenian",
  /** Hungarian */
  HU = 'hu',// "Hungarian",
  /** Upper Sorbian */
  HSB = 'hsb',// "Upper Sorbian",
  /** Croatian */
  HR = 'hr',// "Croatian",
  /** Hindi */
  HI = 'hi',// "Hindi",
  /** Hebrew */
  HE = 'he',// "Hebrew",
  /** Hausa */
  HA = 'ha',// "Hausa",
  /** Gujarati */
  GU = 'gu',// "Gujarati",
  /** Alsatian */
  GSW = 'gsw',// "Alsatian",
  /** Galician */
  GL = 'gl',// "Galician",
  /** Scottish Gaelic */
  GD = 'gd',// "Scottish Gaelic",
  /** Irish */
  GA = 'ga',// "Irish",
  /** Frisian */
  FY = 'fy',// "Frisian",
  /** French */
  FR = 'fr',// "French",
  /** Faroese */
  FO = 'fo',// "Faroese",
  /** Filipino */
  FIL = 'fil',// "Filipino",
  /** Finnish */
  FI = 'fi',// "Finnish",
  /** Persian */
  FA = 'fa',// "Persian",
  /** Basque */
  EU = 'eu',// "Basque",
  /** Estonian */
  ET = 'et',// "Estonian",
  /** Spanish */
  ES = 'es',// "Spanish",
  /** English */
  EN = 'en',// "English",
  /** Greek */
  EL = 'el',// "Greek",
  /** Divehi */
  DV = 'dv',// "Divehi",
  /** Lower Sorbian */
  DSB = 'dsb',// "Lower Sorbian",
  /** German */
  DE = 'de',// "German",
  /** Danish */
  DA = 'da',// "Danish",
  /** Welsh */
  CY = 'cy',// "Welsh",
  /** Czech */
  CS = 'cs',// "Czech",
  /** Corsican */
  CO = 'co',// "Corsican",
  /** Catalan */
  CA = 'ca',// "Catalan",
  /** Bosnian */
  BS = 'bs',// "Bosnian",
  /** Breton */
  BR = 'br',// "Breton",
  /** Tibetan */
  BO = 'bo',// "Tibetan",
  /** Bengali */
  BN = 'bn',// "Bengali",
  /** Bulgarian */
  BG = 'bg',// "Bulgarian",
  /** Belarusian */
  BE = 'be',// "Belarusian",
  /** Bashkir */
  BA = 'ba',// "Bashkir",
  /** Azeri */
  AZ = 'az',// "Azeri",
  /** Assamese */
  AS = 'as',// "Assamese",
  /** Mapudungun */
  ARN = 'arn',// "Mapudungun",
  /** Arabic */
  AR = 'ar',// "Arabic",
  /** Amharic */
  AM = 'am',// "Amharic",
  /** Afrikaans */
  AF = 'af'// "Afrikaans"
}
