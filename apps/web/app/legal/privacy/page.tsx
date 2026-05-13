export const metadata = {
  title: "Politique de confidentialité",
  description: "Quelles données Montasser collecte, pourquoi, et comment tu peux les contrôler.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p>
        Ce document est un <strong>modèle</strong> à faire valider par un DPO ou un avocat
        avant mise en production. Il explique quelles données Montasser collecte,
        pourquoi, et comment tu peux les contrôler.
      </p>

      <h2>1. Données que nous collectons</h2>
      <p>
        Le site est <strong>100% public et anonyme</strong> : nous ne te demandons aucune
        information personnelle, et nous ne créons pas de compte utilisateur.
      </p>
      <ul>
        <li><strong>Techniques (côté serveur)</strong> : adresse IP brute reçue par notre hébergeur (Vercel) le temps de servir la requête, user-agent, referrer. Pas de cookie d'identification.</li>
        <li><strong>Métriques agrégées</strong> : nombre de visites par page, sans identifier les visiteurs individuellement.</li>
      </ul>

      <p>
        <strong>Important :</strong> nous ne traçons pas ce que tu fais sur 1xBet. Le bouton
        "Parier sur 1xBet" ouvre simplement notre lien partenaire dans un nouvel onglet ;
        toute activité au-delà appartient à 1xBet.
      </p>

      <h2>2. À quoi servent ces données</h2>
      <ul>
        <li>Servir le site (logs serveur Vercel) ;</li>
        <li>Détecter les abus (scraping, attaque, bots) ;</li>
        <li>Améliorer la précision du modèle IA via les statistiques agrégées de consultation des pronostics.</li>
      </ul>

      <h2>3. Base légale (RGPD)</h2>
      <ul>
        <li><strong>Intérêt légitime</strong> : journalisation technique, détection d'abus, mesure d'audience anonyme.</li>
        <li><strong>Consentement</strong> : cookies non strictement nécessaires (le cas échéant).</li>
      </ul>

      <h2>4. Conservation</h2>
      <ul>
        <li>Logs Vercel : 30 jours, puis suppression automatique.</li>
        <li>Statistiques de consultation des pronostics : agrégées sans identifiant.</li>
      </ul>

      <h2>5. Partage</h2>
      <p>Aucune donnée personnelle n'est partagée, par construction (nous n'en collectons pas). Nos sous-traitants techniques :</p>
      <ul>
        <li><strong>Vercel</strong> — hébergement web (UE/US).</li>
        <li><strong>Supabase</strong> — base de données contenant les pronostics (UE).</li>
        <li><strong>Anthropic</strong> — génération des pronostics par IA. Aucune donnée d'utilisateur envoyée (seulement les statistiques publiques des matchs).</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>Le site n'utilise aucun cookie d'identification ni de tracking publicitaire.</p>

      <h2>7. Mineurs</h2>
      <p>
        Le Service est réservé aux 18+. Le pari sportif est interdit aux mineurs ;
        merci de ne pas utiliser ce site si tu n'as pas l'âge légal.
      </p>

      <h2>8. Modifications</h2>
      <p>Nous publierons toute modification substantielle sur cette page.</p>

      <h2>9. Contact</h2>
      <p>
        Pour toute question : <a href="mailto:privacy@affiliateai.example">privacy@affiliateai.example</a>.
        Tu peux aussi déposer une plainte auprès de la CNIL.
      </p>
    </>
  );
}
