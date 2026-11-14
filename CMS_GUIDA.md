# Gestione del sito con Pages CMS

Il sito continua a essere ospitato gratuitamente su GitHub Pages.
L'editor Pages CMS modifica i file in `cms/`; le pagine li leggono automaticamente mantenendo il layout e i temi già presenti.

## Attivazione iniziale (da fare con il proprio account GitHub)
1. Aprire https://app.pagescms.org/.
2. Entrare tramite **Sign in with GitHub**.
3. Autorizzare/installare Pages CMS per il repository **BorsatoAndrea/BorsatoAndrea.github.io**. Questa autorizzazione spetta al proprietario dell'account.
4. Nel selettore dei rami scegliere **draft/google-sites-migration**. **Questo è il ramo pubblicato da GitHub Pages.** Le modifiche su `main` non vengono pubblicate.
5. Aprire una voce del menu (Home, Pubblicazioni recenti, Insegnamenti, Supervisione, Archivio ricerca).

## Regola bilingue
Tutti i record condividono campi per **English** e **Italiano**. Quando si aggiunge o si cambia un testo, aggiornare **entrambe** le versioni prima di salvare. Pages CMS non traduce automaticamente. Il nome dello studente, il DOI e l'ordine delle pubblicazioni sono condivisi.

## Sezioni disponibili
- **Home e contatti**: biografia e contatti EN/IT; fotografia personale e tramonto condivisi.
- **Ultime pubblicazioni**: cinque citazioni iniziali, modificabili e riordinabili; aggiungere un riferimento EN/IT insieme.
- **Insegnamenti**: quattro corsi iniziali con titoli e descrizioni EN/IT; aggiungere o riordinare.
- **Supervisione**: Emma Greeff e Sarah Pinel; periodo e dettagli per entrambe le lingue.
- **Archivio di ricerca**: articoli, tesi, libri e capitoli; citazioni e abstract EN/IT; lavori in corso e note.

## Pubblicazione
Salvare i dati sul ramo **draft/google-sites-migration**. GitHub Pages rigenera il sito automaticamente dopo il commit. Per verificare, aprire:
- https://borsatoandrea.github.io/English.html
- https://borsatoandrea.github.io/Italiano.html
- https://borsatoandrea.github.io/Research.html
- https://borsatoandrea.github.io/Ricerca.html
- https://borsatoandrea.github.io/Teaching.html
- https://borsatoandrea.github.io/Insegnamenti.html

La grafica, i temi e le animazioni restano in HTML, CSS e JS e non sono gestiti dal CMS.

## Ripristino
Le pagine HTML includono i testi precedenti come contenuti di riserva: se il file JSON manca o non viene caricato, restano visibili le pagine statiche. Ogni salvataggio del CMS è inoltre un commit GitHub, per cui si può recuperare una versione precedente dal registro dei commit.

## Note
- Durante la prima migrazione alcuni contenuti mantengono formattazioni HTML ereditate da Google Sites. L'editor visivo può semplificarle quando si salva.
- Per i testi con due lingue è necessario aggiornare entrambi i campi: l'omogeneità non comporta una traduzione automatica.
- Non eliminare i file `cms/*.json` né cambiare il nome del ramo pubblicato.
