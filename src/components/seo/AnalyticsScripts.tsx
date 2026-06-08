import { Helmet } from 'react-helmet-async'

interface AnalyticsScriptsProps {
  ga4Id?: string | null
  gtmId?: string | null
}

export function AnalyticsScripts({ ga4Id, gtmId }: AnalyticsScriptsProps) {
  if (!ga4Id && !gtmId) return null

  return (
    <Helmet>
      {gtmId && (
        <script>{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}</script>
      )}
      {ga4Id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
          <script>{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4Id}');
          `}</script>
        </>
      )}
    </Helmet>
  )
}
