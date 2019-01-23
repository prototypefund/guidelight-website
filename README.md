# GuideLight the Website

## Start Flask during development

1. start MongoDB with _mongod --config=".../mongod.cfg"_
2. cd guidelight/
3. . env/bin/activate
4. export FLASK_APP=guidelight
5. export FLASK_ENV=development
6. flask run

``` Site

. Home
├── Blog
|   ├── DSGVO
|   ├── Auskunftsrecht
|   ├── Mahnung
|   ├── Vergessenwerden
|   ├── Berichtigung
|   ├── Widerspruchsrecht
|   ├── Einschränkung
|   ├── Profiling
|   ├── Datenübertragung
|   ├── Datenbank
|   ├── GuideLight
|   └── BDSG
├── Search
|   ├── Entity (Unternehmen||Behörde)
|   |   ├── Informationen zu Entität
|   |   └── Funktionsauswahl
|   |       └── Formular Generator
|   |           ├── Mail
|   |           ├── Kontaktformular
|   |           └── Brief/PDF
|   .
|   └── Default
|       └── Blanko Formular Generator
├── About
├── API
├── Datenschutz
└── Impressum

```