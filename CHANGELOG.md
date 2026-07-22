# Änderungsverlauf

## Version 2.2.2 – Symbole für Wünsche

- 96 auswählbare Emojis für Wünsche ergänzt.
- Symbole in sechs übersichtliche Bereiche sortiert.
- Große Vorschau des aktuell gewählten Symbols eingebaut.
- Eigenes Emoji kann weiterhin eingegeben und übernommen werden.
- Vorhandene Wünsche können nachträglich mit einem anderen Symbol gespeichert werden.
- Speicher- und Löschfunktionen aus Version 2.2.1 bleiben unverändert erhalten.
- Offline-Cache und Versionskennung wurden auf 2.2.2 angehoben.

# Änderungsprotokoll

## Version 2.2.1 – Tagesmissionen und Wünsche Hotfix

- Tagesmissionen können wieder zuverlässig neu angelegt und bearbeitet werden. Der Speichern-Button nutzt einen direkten, vom Browserformular unabhängigen Ablauf.
- Wünsche können wieder zuverlässig neu angelegt und bearbeitet werden. Der Speichern-Button nutzt einen direkten, vom Browserformular unabhängigen Ablauf.
- Nach jedem Speichern wird geprüft, ob der Eintrag wirklich im Gerätespeicher vorhanden ist.
- Bei einem Fehler bleibt das Formular geöffnet und zeigt eine verständliche Meldung.
- Tagesmissionen können endgültig gelöscht werden.
- Wünsche können endgültig gelöscht werden. Offene Wunschvormerkungen werden dabei entfernt und vorgemerkte Münzen automatisch zurückgegeben.
- Auch eine vollständig leere Wunschliste bleibt nach Neustart und Synchronisierung leer; Standardwünsche werden nicht erneut eingesetzt.
- Offline-Cache und Versionskennung wurden auf 2.2.1 angehoben.

# Änderungsverlauf

## Version 2.2.0 – Altersgerechte Aufgaben

- Kinderprofile enthalten jetzt Geburtsmonat und Geburtsjahr.
- Das Alter wird automatisch berechnet und in der Kinderverwaltung angezeigt.
- Aufgaben können ohne Altersgrenze oder mit einem Mindestalter für die alleinige Durchführung angelegt werden.
- Jüngere Kinder können optional gemeinsam mit einem älteren Kind an einer Aufgabe teilnehmen.
- Für begleitete Aufgaben lassen sich Mindestalter des jüngeren Kindes und Mindestalter des Begleitkindes festlegen.
- Eine begleitete Aufgabe kann erst erledigt gemeldet werden, wenn ein passendes älteres Kind beteiligt ist.
- Im Kinderbereich werden passende Aufgaben zuerst angezeigt; nicht passende altersbegrenzte Aufgaben bleiben verborgen.
- In der Mitmach-Runde werden ebenfalls nur altersgerechte Aufgaben angeboten.
- Die Aufgabenverwaltung ist nach Mindestalter sortiert und zeigt jede Altersregel direkt an.
- Bestehende Kinder, Aufgaben, Welten, Belohnungen und Synchronisierungsdaten bleiben erhalten.
- Offline-Cache und Synchronisierungskennung wurden auf Version 2.2.0 angehoben.

## Version 2.1.3 – Aufgabenverwaltung-Hotfix

- Aufgaben können wieder zuverlässig neu angelegt und gespeichert werden.
- Vorhandene Aufgaben können bearbeitet und dauerhaft aktualisiert werden.
- Jede Aufgabe kann nach einer Sicherheitsabfrage endgültig gelöscht werden.
- Zugehörige offene Aufgabenzuordnungen werden beim Löschen sauber entfernt.
- Nach jedem Speichern wird der lokale Datenstand geprüft.
- Unveränderte Geräte senden beim Schließen keinen alten Datenstand mehr an die Synchronisierung.
- Der Offline-Cache wurde auf Version 2.1.3 angehoben.

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
