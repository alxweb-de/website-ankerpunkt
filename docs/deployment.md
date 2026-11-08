# Veröffentlichung von ef-horhausen.de

Die Webseite wird mit GitHub Actions gebaut (`npm ci`, `npm run build`, Node.js 22) und per SFTP in das
Startverzeichnis des separaten STRATO-Zugangs für EF Horhausen (`/ef-horhausen`) hochgeladen.
Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

## Ablauf

```
Push auf master ──────────┐
Sanity-Webhook ───────────┼─► Warteschlange ─► npm ci ─► npm run build ─► Build prüfen
Manuell (Run workflow) ───┘   (nie 2 gleichzeitig)                         │
                                                              Modus nur-build? ─► Ende
                                                                           │
                                     SFTP-Verbindung (geprüfter Serverschlüssel)
                                     Markierungsdatei .ef-horhausen-deploy vorhanden?
                                                                           │
                                     testlauf: anzeigen, was übertragen würde (ändert nichts)
                                     veroeffentlichen: 1. CSS/JS/Bilder/Schriften
                                                       2. HTML und .htaccess
                                                       3. Prüfen: ef-horhausen.de antwortet mit 200
```

| Auslöser | Was passiert |
|---|---|
| Push auf `master` | Upload nur bei `AUTO_DEPLOY_ENABLED = true`, sonst nur Build. Änderungen nur an `docs/` oder `*.md` im Hauptordner lösen nichts aus. |
| Sanity-Webhook | Läuft nur bei `SANITY_WEBHOOK_ENABLED = true`. Upload nur bei `AUTO_DEPLOY_ENABLED = true`. Wartet vorher 60 Sekunden, um mehrere Änderungen zu bündeln. |
| Manuell | Modus frei wählbar: `nur-build`, `testlauf`, `veroeffentlichen` (Standard: `nur-build`) |

**Schutzmaßnahmen**

- Auf dem Server wird nichts gelöscht (kein `--delete`), nur hinzugefügt und überschrieben.
- Ziel ist ausschließlich das Startverzeichnis des SFTP-Zugangs, im Workflow steht kein Serverpfad.
- Ohne die Markierungsdatei `.ef-horhausen-deploy` im Startverzeichnis lädt der Workflow nichts hoch. Das schützt
  davor, versehentlich mit einem falschen Zugang (z. B. dem Hauptzugang) in ein anderes Verzeichnis zu schreiben.
- Die Verbindung kommt nur zustande, wenn der Server den hinterlegten Schlüssel hat.
- Zugangsdaten stehen nur in GitHub Secrets. Das Passwort steht weder in Befehlszeilen noch im Log.
  Das Repository ist öffentlich, also auch die Logs.

**Bekannte Einschränkungen**

- Während des Uploads (wenige Sekunden) liegt auf dem Server teils alter, teils neuer Stand.
- Gelöschte Seiten (z. B. eine vergangene Veranstaltung) und alte Dateien in `_astro/` und `media/sanity/` bleiben
  auf dem Server liegen. Sie sind nicht mehr verlinkt und nicht in der Sitemap. Gelegentlich von Hand per SFTP aufräumen.

## Einrichtung in GitHub

### 1. Umgebung `production`

Gehe zu **Settings → Environments → New environment**, Name: `production`.

- **Deployment branches and tags:** *Selected branches and tags* → Regel `master` hinzufügen.
- Optional **Required reviewers:** Dann muss jeder Lauf per Klick freigegeben werden. Sanity-Änderungen gehen
  dann nicht mehr vollautomatisch live.

### 2. Secrets in der Umgebung `production`

Lege sie unter **Settings → Environments → production → Environment secrets → Add secret** an:

| Secret | Inhalt |
|---|---|
| `STRATO_SFTP_HOST` | SFTP-Server laut STRATO-Kundenbereich (in der Regel `ssh.strato.de`) |
| `STRATO_SFTP_USER` | Benutzername des **separaten** EF-Horhausen-SFTP-Zugangs |
| `STRATO_SFTP_PASSWORD` | Passwort dieses Zugangs |
| `STRATO_SFTP_KNOWN_HOSTS` | Serverschlüssel (siehe unten) |

**Serverschlüssel ermitteln:** Am eigenen Rechner ausführen:

```sh
ssh-keyscan -t ed25519,rsa ssh.strato.de > strato_known_hosts
ssh-keygen -lf strato_known_hosts
```

Vergleiche die angezeigten Fingerabdrücke (`SHA256:…`) mit denen, die dein SFTP-Programm (z. B. FileZilla) bei
der ersten Verbindung anzeigt. Stimmen sie überein, kopierst du den **gesamten Inhalt** von
`strato_known_hosts` (alle Zeilen ohne `#`) in das Secret. Danach kannst du die Datei löschen.

### 3. Variablen

Lege sie unter **Settings → Secrets and variables → Actions → Variables → New repository variable** an:

| Variable | Anfangs | Bedeutung |
|---|---|---|
| `AUTO_DEPLOY_ENABLED` | `false` | `true`: Push und Sanity veröffentlichen automatisch |
| `SANITY_WEBHOOK_ENABLED` | `false` | `true`: Sanity-Auslöser werden ausgeführt |

Fehlt eine Variable, gilt sie als ausgeschaltet.

### 4. Markierungsdatei auf dem Server

Verbinde dich einmalig mit dem EF-Horhausen-Zugang per SFTP-Programm. Lege im Startverzeichnis
(dort, wo auch `index.html` liegt bzw. liegen soll) eine **leere Datei** namens `.ef-horhausen-deploy` an.

### 5. Testen und freischalten

1. **Actions → Deploy → Run workflow → Modus `nur-build`**: prüft den Build ohne Serverzugriff.
2. **Modus `testlauf`**: prüft Zugangsdaten, Serverschlüssel und Markierungsdatei und listet auf, was übertragen
   würde. Auf dem Server ändert sich nichts.
3. **Modus `veroeffentlichen`**: erster echter Upload. Danach die Webseite im Browser prüfen.
4. Wenn alles passt: `AUTO_DEPLOY_ENABLED` auf `true` setzen (Push veröffentlicht automatisch).
5. Erst danach den Sanity-Webhook einrichten (unten) und `SANITY_WEBHOOK_ENABLED` auf `true` setzen.

**Not-Aus:** `AUTO_DEPLOY_ENABLED` auf `false` setzen. Danach wird nur noch gebaut, aber nichts hochgeladen.

## Sanity-Webhook

### Token in GitHub erstellen

Gehe zu **GitHub → Profilbild → Settings → Developer settings → Personal access tokens → Fine-grained tokens →
Generate new token**.

- **Token name:** `sanity-webhook-ef-horhausen`
- **Expiration:** z. B. 1 Jahr. Vor Ablauf einen neuen Token erstellen und in Sanity eintragen.
- **Resource owner:** `alxweb-de`
- **Repository access:** *Only select repositories* → `website-ankerpunkt`
- **Permissions → Repository permissions → Contents: Read and write**. Das ist für `repository_dispatch` nötig,
  weitere Rechte braucht der Token nicht.

Gib den Token nur in Sanity ein und speichere ihn nirgends sonst. Mit diesem Recht könnte er auch Code in dieses
Repository schreiben.

### Webhook in Sanity anlegen

Gehe zu **sanity.io/manage → Projekt Ankerpunkt → API → Webhooks → Create webhook**.

| Feld | Wert |
|---|---|
| Name | `GitHub Deploy ef-horhausen.de` |
| URL | `https://api.github.com/repos/alxweb-de/website-ankerpunkt/dispatches` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["homePage", "aboutPage", "topicPage", "event", "recurringEvent", "person", "settings"]` |
| Projection | `{"event_type": "sanity-publish"}` |
| Status | **Disabled**, bis die Tests oben abgeschlossen sind |
| HTTP method | `POST` |
| HTTP Headers | `Authorization: Bearer <Token>` · `Accept: application/vnd.github+json` · `X-GitHub-Api-Version: 2022-11-28` |
| API version | neueste angebotene |
| Drafts | **aus** (nur veröffentlichte Änderungen) |
| Versions | **aus** |
| Secret | leer lassen. GitHub prüft keine Sanity-Signatur, die Absicherung übernimmt der Token. |

Den Filter musst du erweitern, wenn in Sanity neue Dokumenttypen hinzukommen, die auf der Webseite erscheinen.

**Freischalten:** Setze in GitHub `SANITY_WEBHOOK_ENABLED = true` und den Webhook in Sanity auf *Enabled*.
Veröffentliche dann eine kleine Änderung. Im *Attempts log* des Webhooks sollte **HTTP 204** stehen, und unter
Actions sollte ein Lauf „repository_dispatch“ erscheinen.

### Absicherung des Webhooks

- **Unberechtigte Auslösung:** Die GitHub-Schnittstelle nimmt Auslöser nur mit gültigem Token an. Ohne Token gibt
  es keinen Build. Der Workflow reagiert nur auf den Typ `sanity-publish` und wertet keine mitgesendeten Daten aus.
  Über den Webhook kann also kein Code eingeschleust werden.
- **Häufige Builds:** Es läuft höchstens ein Lauf, und höchstens einer wartet. Jeder neue Auslöser ersetzt den
  wartenden. Die Sammelpause von 60 Sekunden bündelt mehrere Veröffentlichungen. Selbst bei Dauerauslösung
  entstehen nur aufeinanderfolgende Builds, keine parallelen. Der Filter in Sanity verhindert Builds bei
  Änderungen, die die Webseite nicht betreffen.
- **Bei Verdacht auf Missbrauch:** Token in GitHub widerrufen, `SANITY_WEBHOOK_ENABLED` auf `false` setzen und den
  Webhook in Sanity deaktivieren.
