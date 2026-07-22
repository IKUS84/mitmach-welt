# Mitmach-Welt 2.1.0

Mitmach-Welt ist eine installierbare Web-App für Aufgaben, Tagesmissionen, persönliche Welten und gemeinsame Erfolge in einer Kinder- und Jugendwohngruppe.

## Neu: Diensttelefon und Kinder-Tablet verbinden

Version 2.1.0 enthält eine verschlüsselte Gerätesynchronisierung für den Testbetrieb.

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
