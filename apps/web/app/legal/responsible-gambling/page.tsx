export const metadata = {
  title: "Jeu responsable",
  description: "Joue avec un budget que tu peux te permettre de perdre. Voici comment garder le contrôle.",
};

export default function ResponsibleGamblingPage() {
  return (
    <>
      <h1>Jeu responsable</h1>

      <p>
        Le pari sportif est un divertissement, jamais une source de revenus. Les
        prédictions IA d'Montasser Pro <strong>améliorent</strong> tes décisions mais ne
        <strong> garantissent</strong> jamais un résultat.
      </p>

      <h2>5 règles simples</h2>
      <ul>
        <li><strong>Fixe un budget</strong> mensuel pour les paris. Ne dépasse jamais cette somme.</li>
        <li><strong>Ne joue jamais</strong> avec de l'argent emprunté ou destiné à des frais essentiels.</li>
        <li><strong>Ne cours pas après tes pertes.</strong> Une mauvaise journée n'appelle pas une mise plus grande.</li>
        <li><strong>Pause régulière.</strong> Coupe les sessions à durée fixe, peu importe le résultat.</li>
        <li><strong>Ne joue jamais sous l'effet</strong> d'alcool, de stupéfiants ou d'émotions fortes.</li>
      </ul>

      <h2>Signaux d'alerte</h2>
      <p>Tu devrais demander de l'aide si tu :</p>
      <ul>
        <li>penses au jeu en permanence ;</li>
        <li>caches tes paris à tes proches ;</li>
        <li>augmentes les mises pour ressentir la même excitation ;</li>
        <li>empruntes pour jouer ;</li>
        <li>te sens irritable quand tu ne joues pas.</li>
      </ul>

      <h2>Outils disponibles</h2>
      <ul>
        <li><strong>Quitter ce site :</strong> il est public, aucune donnée n'est collectée à ton sujet. Fermer l'onglet suffit.</li>
        <li><strong>Limites côté 1xBet :</strong> 1xBet propose des limites de dépôt et d'auto-exclusion. Active-les directement depuis ton compte 1xBet — c'est l'outil le plus efficace.</li>
        <li><strong>Bloqueurs de sites :</strong> des extensions comme Gamban, BetBlocker (gratuites) bloquent l'accès aux sites de pari.</li>
      </ul>

      <h2>Lignes d'écoute et d'aide</h2>
      <p>Ces services sont gratuits, anonymes et opérés par des professionnels :</p>
      <ul>
        <li><strong>Joueurs Info Service (France)</strong> : 09 74 75 13 13 — du lundi au dimanche, 8h–2h. <a href="https://www.joueurs-info-service.fr" target="_blank" rel="noopener noreferrer">joueurs-info-service.fr</a></li>
        <li><strong>SOS Joueurs (France)</strong> : 09 69 39 55 12. <a href="https://www.sosjoueurs.org" target="_blank" rel="noopener noreferrer">sosjoueurs.org</a></li>
        <li><strong>Adictel (Belgique, Suisse, France)</strong> : <a href="https://adictel.com" target="_blank" rel="noopener noreferrer">adictel.com</a></li>
        <li><strong>BeGambleAware (UK)</strong> : 0808 8020 133. <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">begambleaware.org</a></li>
        <li><strong>Gambling Helpline (international)</strong> : <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer">gamblingtherapy.org</a></li>
      </ul>

      <h2>Restrictions par juridiction</h2>
      <p>
        Le pari en ligne et la promotion de bookmakers étrangers sont réglementés
        différemment selon les pays. <strong>1xBet est restreint ou interdit</strong> en
        France, au Royaume-Uni, aux Pays-Bas, et dans plusieurs autres juridictions.
        Vérifie la légalité dans ton pays avant d'utiliser nos liens d'affiliation.
      </p>

      <p className="text-xs text-muted-foreground">
        18+. Le jeu peut être dangereux. Pertes excessives, isolement, endettement —
        appelle, ce ne sera pas pris contre toi.
      </p>
    </>
  );
}
