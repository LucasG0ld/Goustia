import { LegalPage } from "@/components/legal-page";

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies et autres traceurs">
      <section>
        <h2>Traceurs nécessaires</h2>
        <p>
          Supabase Auth utilise des cookies nécessaires pour maintenir et
          sécuriser la session. Ils ne servent pas à la publicité et ne peuvent
          pas être désactivés sans rendre la connexion inutilisable.
        </p>
      </section>
      <section>
        <h2>Mesure d’audience</h2>
        <p>
          Aucun outil d’audience externe n’est actif par défaut. Umami pourra
          être activé ultérieurement avec une configuration respectueuse de la
          vie privée, après vérification de l’exemption ou recueil d’un
          consentement valide. Aucun suivi publicitaire, fingerprinting, heatmap
          ou rejeu de session n’est prévu.
        </p>
      </section>
      <section>
        <h2>Choix et retrait</h2>
        <p>
          Si des traceurs non nécessaires sont ajoutés, un panneau permettra de
          les refuser aussi facilement que de les accepter, par finalité, avant
          tout dépôt. Le choix sera versionné et modifiable à tout moment.
        </p>
      </section>
    </LegalPage>
  );
}
