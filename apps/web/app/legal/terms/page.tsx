export const metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation de la plateforme Montasser.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Conditions générales d'utilisation</h1>
      <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p>
        Ce document est un <strong>modèle</strong> à faire valider par un avocat avant mise
        en production. Il décrit les conditions générales d'utilisation (CGU) du service
        Montasser ("le Service").
      </p>

      <h2>1. Acceptation</h2>
      <p>
        En accédant au Service, tu acceptes ces CGU. Si tu n'acceptes pas, n'utilise pas
        le Service.
      </p>

      <h2>2. Âge minimum</h2>
      <p>
        Le Service est réservé aux personnes majeures (18 ans ou plus). En accédant au
        Service tu certifies avoir l'âge légal de jouer de l'argent dans ta juridiction.
      </p>

      <h2>3. Nature du Service</h2>
      <p>
        Montasser fournit des analyses sportives propulsées par intelligence
        artificielle à titre purement informatif.{" "}
        <strong>Aucune analyse ne constitue une garantie de gain.</strong> Les pronostics
        sont basés sur des données statistiques publiques et peuvent se tromper.
      </p>
      <p>
        Le Service est <strong>public et anonyme</strong> : aucun compte utilisateur,
        aucune donnée personnelle collectée volontairement.
      </p>
      <p>
        Le bouton "Parier sur 1xBet" redirige vers 1xBet via un lien partenaire.
        Montasser n'est ni 1xBet, ni un opérateur de paris : nous n'hébergeons ni ne
        traitons aucune transaction financière.
      </p>

      <h2>4. Conduite</h2>
      <p>Tu acceptes de ne pas :</p>
      <ul>
        <li>utiliser le Service pour des activités illégales dans ta juridiction ;</li>
        <li>scraper ou rétro-ingéniérer le Service à grande échelle ;</li>
        <li>tenter de saturer ou compromettre l'infrastructure.</li>
      </ul>

      <h2>5. Limitation de responsabilité</h2>
      <p>
        Dans la mesure permise par la loi, Montasser ne peut être tenu responsable des
        pertes financières liées aux paris effectués sur la base des pronostics, ni des
        indisponibilités de plateformes tierces (1xBet, fournisseurs de données
        sportives).
      </p>

      <h2>6. Modifications</h2>
      <p>
        Nous pouvons modifier ces CGU à tout moment. Les modifications prennent effet à
        leur publication.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Ces CGU sont régies par le droit français. Tout litige sera porté devant les
        tribunaux compétents.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question : <a href="mailto:legal@affiliateai.example">legal@affiliateai.example</a>
      </p>
    </>
  );
}
