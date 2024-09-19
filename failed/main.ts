import { handleIncomingEmail } from '../src/emailProcessor';
import { saveToFile } from '../src/fileService';

const rawEmailText =  `
Denne besked er sendt fra Peter Plass Jensen, 31. aug. 2024 13.52
Hejsa
jeg har købt et
# Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid
ved jer og det lader ikke rigtig op tror jeg den bliver ikke grøn med kun orange der er et billede af
det, det kan god tænde og slukke men har stået nu i 9 timer og bliver ikke grøn.
er det en bytter eller hvad ?
### Ordre
Ordrenummer: 1413105
Ordredato: 22/08 2024
De andre lys virker fint

Mvh *firstname

Den tors. 22. aug. 2024 kl. 10.35 skrev WWW.HJEM.DK ApS :
> ![WWW.HJEM.DK ApS](https://sw12669.sfstatic.io/upload_dir/pics/NytLogo2.png)
>
> # Ordrebekræftelse (Nr. 1413105)
>
> Hej *firstname *lastname,
>
> **_Hvis du har købt flere varer på samme ordre med forskellige leveringstider, sender vi din
ordre samlet._**
>
>
>
> Hvad sker der nu:
>
> 1. Når vi pakker din ordre, modtager du først en mail med track and trace på pakken.
> 2. Når pakken er afsendt, modtager du en faktura, og først herefter hæver vi penge for købet.
>
>
>
> **Hvis du har valgt afhentning**
>
> Har du valgt at afhente dine varer i Silkeborg, vil du modtage en sms og email med dit
udleveringsnummer og kørselsinstruktion, så snart dine varer ligger klar til afhentning.
>
>
>
> ### Ordre
>
> Ordrenummer: 1413105
> Ordredato: 22/08 2024
> Betalingsmetode: Kreditkortbetaling (#82350)

> Korttype: dankort (DK)
> Status: Under behandling
>
> ### Varer
>
> ![Sirius Sille Genopladeligt Fyrfadslys 2 stk. Ø6 cm, Hvid](https://sw12669.sfstatic.io/upload_dir/
shop/Sirius23/_thumbs/80672.w80.h80.jpg)
>
> Sirius Sille Genopladeligt Fyrfadslys 2 stk. Ø6 cm, Hvid 374,92 kr.
>
> Antal: 2 stk.
> Varenr.: 110456
>
> Pris pr. stk: 187,46 kr.
> Levering 5-10 Hverdage
>
>
>
>
> ![Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid](https://sw12669.sfstatic.io/upload_dir/shop/
Sirius/_thumbs/80621.w80.h80.jpg)
>
> Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid 119,96 kr.
>
> Antal: 1 stk.
> Varenr.: 1054850
>
> På lager 1-2 Hverdage
>
>
> * * *
>
> Fragt: GLS PakkeShop 59,00 kr.
> Samlet køb: 553,88 kr.
> Heraf moms: 110,78 kr.
> **Total:** **553,88 kr.**
>
> Mine ordrer
>
> ### Leveringsadresse
> *by *sted
> *adresse *nummer
> *tal
> *postnummer *sted, Danmark
> ### Kundeoplysninger
> *fistname *middlename *lastname
> *adresse
> *postnummer *sted, Danmark
> Telefonnr.: +45 *phone
> *email@gmail.com
>
>
>
> Har du spørgsmål til din ordre, er du velkommen til at kontakte os på mail info@hjem.dk. Vi
svarer mails, så hurtigt som muligt og normalt inden for én arbejdsdag.
>
> ![Facebook](https://sw12669.sfstatic.io/upload_dir/templates/hjem/assets/images/
facebook.png) ![Instagram](https://sw12669.sfstatic.io/upload_dir/templates/hjem/assets/images/
instagram.png)
>

> **WWW.HJEM.DK ApS**
> Hårup Bygade 14 8600 Silkeborg Danmark
> Telefonnr.: 53 53 11 33 E-mail *: info@hjem.dk
> CVR-nummer: 35251642

--
Med Venlig Hilsen
*firstname A *lastname
*adresse
*postnummer *sted
*email@gmail.com
Mobil xx xx xx xx

> Den mandag. 26. jun. 2024 kl. 14.21 skrev WWW.HJEM.DK ApS :
> ![WWW.HJEM.DK ApS](https://sw12669.sfstatic.io/upload_dir/pics/NytLogo2.png)
>
> # Ordrebekræftelse (Nr. 1413105)
>
> Hej *firstname *lastname,
>
> **_Hvis du har købt flere varer på samme ordre med forskellige leveringstider, sender vi din
ordre samlet._**
>
>
>
> Hvad sker der nu:
>
> 1. Når vi pakker din ordre, modtager du først en mail med track and trace på pakken.
> 2. Når pakken er afsendt, modtager du en faktura, og først herefter hæver vi penge for købet.
>
>
>
> **Hvis du har valgt afhentning**
>
> Har du valgt at afhente dine varer i Silkeborg, vil du modtage en sms og email med dit
udleveringsnummer og kørselsinstruktion, så snart dine varer ligger klar til afhentning.
>
>
> Den tors. 17. jan. 2024 kl. 10.35 skrev WWW.HJEM.DK ApS :
> ![WWW.HJEM.DK ApS](https://sw12669.sfstatic.io/upload_dir/pics/NytLogo2.png)
>
> # Ordrebekræftelse (Nr. 1413105)
>
> Hej *firstname *lastname,
>
> **_Hvis du har købt flere varer på samme ordre med forskellige leveringstider, sender vi din
ordre samlet._**
>
>
>
> Hvad sker der nu:
>
> 1. Når vi pakker din ordre, modtager du først en mail med track and trace på pakken.
> 2. Når pakken er afsendt, modtager du en faktura, og først herefter hæver vi penge for købet.
>
>
>
> **Hvis du har valgt afhentning**
>
> Har du valgt at afhente dine varer i Silkeborg, vil du modtage en sms og email med dit
udleveringsnummer og kørselsinstruktion, så snart dine varer ligger klar til afhentning.
>
>
`;

const emailObject = handleIncomingEmail(rawEmailText);

saveToFile('path/to/your/file.json', JSON.stringify(emailObject));