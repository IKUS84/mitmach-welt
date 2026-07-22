# Änderungsprotokoll

## Version 2.1.0 – Gerätesynchronisierung (Testbetrieb)

- Diensttelefon und Kinder-Tablet können denselben Datenstand verwenden.
- Das erste Gerät erstellt eine Sync-Gruppe und einen geschützten Kopplungslink.
- Das zweite Gerät kann über den Link als Kinder-Tablet oder Erziehergerät verbunden werden.
- Änderungen werden automatisch verschlüsselt übertragen.
- Der zuletzt veröffentlichte Datenstand wird beim späteren Öffnen des anderen Geräts übernommen.
- Bei fehlendem Internet bleiben Änderungen lokal vorgemerkt und werden nach Wiederverbindung gesendet.
- Kinder-Tablet-Modus blendet den Erzieherbereich und die Sync-Einstellungen aus.
- Sync-Status wird in der Kopfzeile angezeigt.
- Vorhandene lokale Daten aus Version 2.0.1 bleiben erhalten.

### Wichtiger Hinweis

Diese Version nutzt für den schnellen Testbetrieb einen öffentlichen Übertragungsdienst. Der Inhalt wird vor der Übertragung mit AES-GCM verschlüsselt; der Kopplungslink enthält den Schlüssel. Für einen dauerhaften Einsatz mit besonders sensiblen Falldaten ist später ein eigener, geschützter Server vorgesehen. Bei längerer Offline-Nutzung sollten nicht gleichzeitig auf beiden Geräten unterschiedliche Änderungen vorgenommen werden, da im Konfliktfall die zuletzt übertragene Änderung gewinnt.

## Version 2.0.1

- Fehler beim Anlegen und Speichern neuer Kinderprofile behoben.
- Speichervorgang wird direkt geprüft.
- Offline-Cache aktualisiert.
