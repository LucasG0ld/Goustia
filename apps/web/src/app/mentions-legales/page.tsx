import { LegalPage } from "@/components/legal-page";

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales">
      <section>
        <h2>Éditeur</h2>
        <p>
          <strong>[Nom ou dénomination sociale à compléter]</strong> —
          <strong>
            {" "}
            [forme juridique, capital, SIREN/RCS et siège à compléter]
          </strong>
          . Directeur de publication : <strong>[à compléter]</strong>. Contact :
          <strong> [e-mail et téléphone à compléter]</strong>.
        </p>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>
          Application web :{" "}
          <strong>[hébergeur, adresse et téléphone à compléter]</strong>. Base
          et authentification Supabase : région et entité contractante à
          compléter après création des environnements hébergés.
        </p>
      </section>
      <section>
        <h2>Propriété intellectuelle et signalement</h2>
        <p>
          Toute reproduction non autorisée des éléments propres à Goustia est
          interdite. Pour signaler une erreur, un contenu ou une atteinte à des
          droits : <strong>[contact à compléter]</strong>.
        </p>
      </section>
    </LegalPage>
  );
}
