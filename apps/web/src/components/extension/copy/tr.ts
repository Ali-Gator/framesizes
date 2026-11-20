import type { ExtensionCopy } from "./en";

export const tr = {
  seo: {
    title: "Chrome için Gallery Wall Layout Generator",
    h1: "Gallery Wall Layout Generator Nasıl Kullanılır",
    description:
      "Gallery Wall Layout Generator Chrome uzantısı nasıl kullanılır: yan panelde duvarınızı planlayın ya da bir mağazadaki posteri gerçek boyutunda deneyin.",
  },
  crumbs: { home: "Ana sayfa", hub: "Galeri duvarı", page: "Chrome uzantısı" },
  answer:
    "Yan paneli açıp bir galeri duvarı planlamak için Chrome araç çubuğundaki uzantı düğmesini tıklayın. Herhangi bir mağazada bir postere sağ tıklayıp “Try on my wall” seçeneğini belirleyin; poster gerçek boyutunda duvarınıza asılsın.",
  store: "Chrome Web Mağazası'ndan edinin",
  noButton: "Düğmeyi göremiyor musunuz?",
  showPin: "Nasıl sabitleneceğini görün",
  pin: {
    title: "Araç çubuğuna sabitleyin",
    text: "Chrome yeni uzantıları yapboz parçası düğmesinin arkasında tutar. Chrome'un sağ üst köşesindeki yapboz parçasını (1), ardından Gallery Wall Layout Generator yanındaki raptiyeyi (2) tıklayın. Düğmesi bundan sonra araç çubuğunda kalır.",
    picture:
      "Chrome araç çubuğu: 1 ile işaretli yapboz parçası düğmesi Uzantılar menüsünü açar, Gallery Wall Layout Generator yanındaki raptiye 2 ile işaretlidir",
    pinned: "Zaten sabitlediniz mi?",
    showUsage: "Nasıl kullanılacağını görün",
  },
  usage: "Yan panelde neler yapabilirsiniz",
  steps: [
    {
      title: "Bir galeri duvarı planlayın",
      figure: "Örnek odada bir kanepenin üstünde beş çerçeve",
      text: "Beş şablondan birini seçin, aralığı ayarlayın ve çerçeveleri taşıyın. Örnek oda hemen çalışır; kendi duvarınızın fotoğrafı bir dakika sürer.",
    },
    {
      title: "Bir mağazadaki posteri deneyin",
      figure: "Bir mağazadaki posterde sağ tık menüsü, Try on my wall seçili",
      text: "Bir postere sağ tıklayın, “Try on my wall” seçeneğini belirleyin ve mağazanın verdiği boyutu seçin. Poster gerçek boyutunda duvarınızda asılı durur.",
    },
    {
      title: "Çivi yerlerini alın",
      figure: "Her birinde numaralı bir çivi olan beş çerçeve",
      text: "Askının çerçevenin üst kenarından ne kadar aşağıda olduğunu yazın. Her çivi, bir köşeden ölçülen bir numara ve bir yer alır.",
    },
  ],
  wall: {
    title: "Kendi duvarınızı kullanın",
    text: "Duvarın tam karşıdan fotoğrafını çekin, sonra boyutunu bildiğiniz bir şeyi işaretleyin. Panel her şeyi buna göre ölçeklendirir:",
    items: [
      "duvarın genişliği",
      "bir kapı (ABD'de {door} yüksekliğinde)",
      "ölçtüğünüz bir kanepe ya da yatak",
      "duvara bantlanmış bir Letter ya da A4 kâğıt",
      "bir kredi kartı",
    ],
  },
  perm: {
    title: "Uzantının görebildikleri",
    rows: [
      {
        dt: "Sağ tık menüsü",
        dd: "Bir resme sağ tıkladığınızda “Try on my wall” seçeneğini ekler.",
      },
      {
        dt: "Tıkladığınız sekme",
        dd: "“Try on my wall” seçeneğini belirlediğinizde o sayfayı bir kez okur: resmi ve metnindeki boyutları. O sitede başka hiçbir şeyi okumaz.",
      },
      {
        dt: "framesizes.app",
        dd: "Uzantının yüklü ve sabitlenmiş olup olmadığını sorabilir. Başka hiçbir şey paylaşılmaz.",
      },
    ],
    tip: "Duvar fotoğrafınız bu bilgisayarda kalır.",
  },
  faq: {
    title: "Sorular",
    items: [
      {
        q: "Her mağazada çalışır mı?",
        a: "Sağ tıklayabileceğiniz bir resim olan her sayfada çalışır. Sayfada boyut yazmıyorsa genişliği ve yüksekliği kendiniz yazın.",
      },
      {
        q: "Düğme neden araç çubuğumda değil?",
        a: "Chrome yeni uzantıları yapboz parçası düğmesinin arkasına koyar. Bir kez sabitleyin, araç çubuğunda kalsın.",
      },
      {
        q: "Hangi tarayıcılarda çalışır?",
        a: "Bilgisayarda Chrome 116 veya daha yeni sürümlerde. Chrome'un yan panelinde açılır.",
      },
    ],
  },
  chrome: {
    extensions: "Uzantılar",
    noAccess: "Erişim gerekmiyor",
    noAccessLines: ["Bu uzantıların bu sitedeki bilgileri görmesi", "ve değiştirmesi gerekmiyor."],
    manage: "Uzantıları yönet",
    copyImage: "Resmi Kopyala",
    inspect: "İncele",
  },
} satisfies ExtensionCopy;
