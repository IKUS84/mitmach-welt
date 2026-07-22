# Mitmach-Welt 2.2.2

Mitmach-Welt ist eine installierbare Web-App für Aufgaben, Tagesmissionen, persönliche Welten und gemeinsame Erfolge in einer Kinder- und Jugendwohngruppe.


## Neu in Version 2.2.2: Symbole für Wünsche

Beim Anlegen und Bearbeiten eines Wunsches gibt es jetzt eine sichtbare Symbolauswahl mit sechs Bereichen:

- Beliebt
- Spiel, Medien & Kreatives
- Essen & Trinken
- Freizeit & Bewegung
- Zeit & besondere Erlebnisse
- Tiere, Natur & Ausflüge

Das ausgewählte Symbol wird sofort groß angezeigt. Ein eigenes Emoji kann weiterhin eingetragen und übernommen werden. Vorhandene Wünsche und deren bisherige Symbole bleiben unverändert.

## Neu: Diensttelefon und Kinder-Tablet verbinden

Version 2.2.2 ergänzt den Wunschladen um eine große, kindgerechte Symbolauswahl. Beim Anlegen oder Bearbeiten eines Wunsches kann direkt aus sechs Bereichen mit insgesamt 96 Emojis gewählt werden. Zusätzlich bleibt ein eigenes Emoji möglich.

### Erstes Gerät einrichten

1. App auf dem Diensttelefon öffnen.
2. Oben rechts auf das Wolken-Symbol tippen.
3. Erzieher-PIN eingeben.
4. **Sync-Gruppe erstellen** wählen.
5. Den Kopplungslink teilen oder kopieren.

### Kinder-Tablet verbinden

1. Den Kopplungslink auf dem Tablet öffnen.
2. **Als Kinder-Tablet verbinden** wählen.
3. Kurz warten, bis der gemeinsame Datenstand übernommen wurde.

Danach können Kinder Aufgaben auf dem Tablet melden. Die Erzieher können die offenen Meldungen auf dem Diensttelefon prüfen und bestätigen. Änderungen werden automatisch abgeglichen, sobald eine Internetverbindung besteht.

## Gerätemodi

- **Erziehergerät:** vollständige App einschließlich Erzieherbereich und Sync-Einstellungen.
- **Kinder-Tablet:** Kinderprofile, Aufgaben, Welten und Gruppenwelt; Erzieherbereich ist ausgeblendet.
- **Vollzugriff:** alle Bereiche sichtbar.

## Datensicherheit

- Daten bleiben zusätzlich lokal auf jedem verbundenen Gerät gespeichert.
- Der übertragene Inhalt wird mit AES-GCM verschlüsselt.
- Gruppenschlüssel und Übertragungsthema werden zufällig erzeugt.
- Der Kopplungslink enthält den Schlüssel und darf nur zwischen Dienstgeräten geteilt werden.
- Export und Import bleiben als zusätzliche Sicherung erhalten.

## Einschränkung des schnellen Test-Syncs

Der Test-Sync verwendet einen öffentlichen Übertragungsdienst. Die Inhalte sind verschlüsselt, aber der Dienst ist nicht als dauerhaft garantierte Fachdaten-Infrastruktur gedacht. Bei gleichzeitigen Änderungen auf beiden Geräten während einer längeren Offline-Phase gewinnt beim nächsten Abgleich der zuletzt veröffentlichte Datenstand. Für den späteren Regelbetrieb ist ein eigener geschützter Backend-Dienst vorgesehen.

## Installation über GitHub Pages

Alle Dateien aus diesem Ordner in das Hauptverzeichnis des GitHub-Repositories hochladen und vorhandene Dateien ersetzen. GitHub Pages bleibt auf `main` und `/(root)` eingestellt.

## Standard-PIN

Sofern noch nicht geändert: `2468`


## Wichtig beim Update auf 2.2.2

Dieses Update baut auf dem Speicher-Hotfix für Tagesmissionen und Wünsche auf und ergänzt die visuelle Symbolauswahl. Bereits gespeicherte Wünsche lassen sich öffnen, mit einem neuen Symbol versehen und wieder speichern. Die Löschfunktion bleibt erhalten.

Kinder, Aufgaben, Welten und Belohnungen bleiben erhalten. Diensttelefon, Tablet und Computer müssen nach dem Hochladen einmal vollständig neu geladen werden.

## Aufgaben verwalten (Version 2.1.3)

Im Erzieherbereich unter **Aufgaben** können Aufgaben angelegt, bearbeitet, pausiert, aktiviert und gelöscht werden. Beim Löschen erscheint eine Sicherheitsabfrage. Offene Zuordnungen zu dieser Aufgabe werden ebenfalls entfernt; bereits gutgeschriebene Belohnungen bleiben bestehen.


## Altersgerechte Aufgaben (Version 2.2.1)

### Kinderprofil

Im Erzieherbereich unter **Kinder** können Geburtsmonat und Geburtsjahr eingetragen werden. Das Alter wird automatisch berechnet und wechselt zu Beginn des jeweiligen Geburtsmonats.

### Aufgabeneditor

Für jede Aufgabe können folgende Regeln festgelegt werden:

- keine Altersgrenze,
- allein möglich ab einem bestimmten Alter,
- jüngere Kinder dürfen mit einem älteren Kind helfen,
- Mindestalter des jüngeren Kindes,
- Mindestalter des begleitenden älteren Kindes.

Beispiel: **allein ab 10 Jahren, mit älterem Kind ab 7 Jahren, Begleitkind mindestens 10 Jahre**. In diesem Fall verlangt die App automatisch mindestens zwei Kinder und lässt die Aufgabe erst als erledigt melden, wenn ein passendes älteres Kind beteiligt ist.

Im Kinderbereich werden Aufgaben automatisch nach Passung sortiert. Noch nicht passende Aufgaben werden ausgeblendet. Im Erzieherbereich sind die Aufgaben nach Mindestalter sortiert und die Altersregel ist direkt sichtbar.
