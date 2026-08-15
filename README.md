# Mitmach-Welt 3.0.3 – 12-Stunden-Automatik & geheime Überraschungssterne

- Baut gezielt auf dem stabilen Stand 3.0.2 auf; Sync- und iPad-Speicherlogik aus 3.0.2 bleiben unangetastet.
- Behebt die blockierte 12-Stunden-Autobestätigung bei Geräten, auf denen aus dem früheren 2.9.1-Hotfix noch `autoApproveEnabled: false` gespeichert war.
- Normale erledigt gemeldete Aufgaben werden wieder spätestens 12 Stunden nach der Meldung automatisch bestätigt; versäumte Prüfungen werden beim nächsten Öffnen nachgeholt.
- Falls bei älteren Meldungen `reportedAt` fehlt, wird der Meldezeitpunkt aus dem vorhandenen Aufgabenverlauf rekonstruiert.
- Ausnahmen bleiben erhalten: ausdrücklich manuell zu prüfende Aufgaben, Aufgaben mit offen sichtbaren Sternen, ausgeschaltete Aufgabenautomatik und ungeklärte Teilnehmer.
- Neue geheime Überraschungssterne: ungefähr alle 5 bis 9 Tage bestimmt das System eine geeignete erledigt gemeldete Aufgabe als Sternaufgabe.
- Der zusätzliche Stern ist für Kinder vor der Bestätigung nirgends sichtbar. Die Aufgabe sieht für das Kind bis dahin wie eine normale Aufgabe aus.
- Eine geheime Sternaufgabe wird niemals nach 12 Stunden automatisch bestätigt, sondern wartet auf die Erzieherbestätigung.
- Erst nach der Bestätigung erhält jedes tatsächlich beteiligte Kind einen zusätzlichen Stern und beim nächsten Öffnen eine deutliche Überraschungsnachricht.
- Die Sternzuordnung wird beim Geräteabgleich geschützt; auch ein gleichzeitig eintreffender älterer Datenstand darf den verdeckten Stern nicht verlieren.
- Wird eine geheime Sternaufgabe abgelehnt, wird kein Stern vergeben und die nächste geeignete Aufgabe kann erneut ausgewählt werden.
- Version, Manifest und Offline-Cache auf 3.0.3 aktualisiert.

## Technische Umsetzung

3.0.3 wird bewusst als kleine Korrekturschicht `hotfix-3.0.3.js` zwischen `app.js` und `sync.js` geladen. Dadurch bleibt die bewährte 3.0.2-Kernlogik für Speicherung und Synchronisierung unverändert, während die korrigierte 12-Stunden-Prüfung und die Überraschungssterne gezielt ergänzt werden.

# Mitmach-Welt 3.0.2 – iPad-Speicher & Geräte-Sync Hotfix

- Behebt den Fehler „Speichern war nicht möglich. Bitte Browser-Speicher prüfen.“ auf dem Kinder-Tablet.
- Ein erfolgreich gespeicherter Hauptstand gilt jetzt auch dann als gespeichert, wenn nur eine optionale Zusatzsicherung wegen knappen Browser-Speichers scheitert.
- Dadurch wird der Sync-Listener wieder zuverlässig ausgelöst und erledigt gemeldete Aufgaben werden an das Erziehergerät übertragen.
- Bei Speicherknappheit werden ausschließlich ersetzbare Backup-Snapshots und Wettercache automatisch bereinigt; Kinder-, Aufgaben-, Punkte- und Verlaufsdaten werden nicht gelöscht.
- Der Snapshot-Ring wurde von fünf vollständigen Kopien auf eine zusätzliche Vollsicherung reduziert.
- Bereits auf dem Kinder-Tablet vorhandene offene Aufgaben aus 3.0.1 bleiben erhalten und werden beim nächsten erfolgreichen Geräteabgleich zusammengeführt.
- 12-Stunden-Autobestätigung aus 3.0.1 und alle Begleiter-Spiele aus 3.0.0 bleiben vollständig erhalten.

# Mitmach-Welt 3.0.1 – Aufgaben-Sync & 12-Stunden-Bestätigung

## Korrekturen

- Baut vollständig auf Version 3.0.0 mit allen Begleiter-Spielen auf.
- Erledigt gemeldete, freigegebene Aufgaben werden 12 Stunden nach der Meldung automatisch bestätigt, wenn vorher kein Erzieher entscheidet.
- Die Prüfung wird beim Öffnen der App und danach regelmäßig nachgeholt; sie ist nicht mehr an 21:00 Uhr oder den Kalendertag gebunden.
- Gemeldete Aufgaben bleiben im Kinderbereich sichtbar, auch wenn inzwischen der nächste Tag begonnen hat.
- Der Geräteabgleich führt Aufgabenstände gezielt zusammen, damit Reservierungen und Erledigt-Meldungen vom Kinder-Tablet nicht durch einen neueren Stand des Erziehergeräts verloren gehen.
- Tagesmissionen werden weiterhin gezielt zusammengeführt.
- Besondere Aufgaben mit Sternen, manueller Prüfung oder ausgeschalteter Automatik bleiben von der automatischen Bestätigung ausgenommen.

## Installation

Alle zehn Dateien im Repository ersetzen. Vorhandene Kinder, Aufgaben, Kontostände, Missionen, Belohnungen und Welten bleiben erhalten.

# Mitmach-Welt 3.0.0 – vier Spiele mit dem Begleiter

## Neu in dieser Version

Die eigene Welt enthält jetzt einen kleinen Spielbereich mit vier freiwilligen Minispielen. Beim Antippen von **Spielen** wählt das Kind selbst aus:

- **🎾 Ballspiel** – der bekannte Ball springt durch das Spielfeld und kann angetippt werden.
- **🃏 Memory** – sechs Bildpaare aus der Welt des Begleiters finden.
- **🏃 Hindernislauf** – gemeinsam über sechs kleine Hindernisse springen, ohne Zeitdruck und ohne Verlieren.
- **🎵 Tanzspiel** – kurze Bewegungsfolgen merken und mit dem Begleiter nachtanzen.

Für alle Spiele gilt weiterhin:

- keine Münzen, Samen oder Sterne,
- keine Rangliste,
- keine tägliche Serie,
- kein Zeitdruck,
- jederzeit beendbar,
- nur freiwilliger Spielspaß mit dem eigenen Begleiter.

Die Spiele laden erst, wenn sie geöffnet werden. Dadurch bleiben die übrigen Seiten der App möglichst leicht. Alle Funktionen aus Version 2.9.0 bleiben erhalten, einschließlich Schlafen, Essen, Suchspiel, Aufgaben, Tagesmissionen, automatische Bestätigungen, Hilfe-Center und Synchronisierung.

## Installation

1. ZIP-Datei entpacken.
2. Alle zehn Dateien in das GitHub-Repository übernehmen und die bisherigen Dateien ersetzen.
3. Commit-Vorschlag: `Mitmach-Welt 3.0.0 – neue Begleiter-Minispiele`
4. Veröffentlichung von GitHub Pages abwarten.
5. App auf Diensthandy und Kinder-Tablet neu öffnen und eine angebotene Aktualisierung installieren.

Eine Datensicherung ist optional. Vorhandene Kinder, Aufgaben, Kontostände, Missionen, Belohnungen, Welten und Verläufe werden übernommen.
