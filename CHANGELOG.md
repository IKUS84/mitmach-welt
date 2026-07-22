# Version 2.1.2 – Kinderverwaltung und Neustart

- Kinder können archiviert, wiederhergestellt und in den Papierkorb verschoben werden.
- Endgültiges Löschen ist nur nach Sicherheitsabfrage möglich und entfernt zugehörige persönliche Daten.
- Neuer Assistent „Neue Gruppe einrichten“ legt sechs leere Kinderprofile mit Münzen, Samen, Sternen und Fortschritten auf null an.
- Aufgaben und Wunschladen können beim Neustart optional erhalten bleiben.
- Jedes Kind kann anschließend gemeinsam eingerichtet werden: Name, Avatar, Farbe, Themenwelt, eigener Weltname und Begleiter.
- Papierkorb und Archiv sind direkt in der Kinderverwaltung sichtbar.

# Änderungsprotokoll

## Version 2.1.2 – Home-Screen-Kopplung und Aufgaben-Priorität

- Kinder-Kopplung wird beim Hinzufügen zum iOS-/iPadOS-Home-Bildschirm über eine kurzlebige, sichere SameSite-Cookie-Vormerkung übernommen.
- Die installierte Kinder-App verbindet sich beim ersten Start automatisch mit dem gemeinsamen Datenstand.
- Ausgewählte und erledigt gemeldete Aufgaben stehen im Kinderbereich ganz oben.
- Im Erzieherbereich erscheinen aktuell ausgewählte Aufgaben nun ebenfalls ganz oben, noch vor der Abendbestätigung.
- Offline-Cache auf Version 2.1.2 aktualisiert.

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
