# TrackExpenses
Quick page that can be installed as a PWA to track expenses throughout the month

Tracking columns will include these:
* Report Type (single letter, normally P=Personal, I=International) (default=whatever was last used since usually it will go in chunks)
* Date (default to today)
* Category (from a list)
* Description (free text)
* Amount (number)
* Currency (can be defaulted via cookie, normally whatever was used last)
* Receipt (0..n photo[s])

ALTERNATE:
* User can populate a single field, presumably by voice to text, allowing other fields to be entered all at once
* Data might look like this
    ```
    Sept 24, 2024 $34.55 USB Charger category equipment
    ```
* This text would then be read by the expense report from the copy/pasted text and divided into fields as well as possible by the expense report software.
  
A quick copy function will copy all items of a given report type to the clipboard and delete them.


