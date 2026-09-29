// 日本語
const ja: Record<string, string> = {
  // ── メタデータ ────────────────────────────────────────────────────
  "meta.site.title": "nokta · デュッセルドルフのデザインスタジオ",
  "meta.site.desc": "デュッセルドルフのデザインスタジオ。建物、本、プリントを描きます。ビジュアライゼーション、組版、製版、CAD図面。",
  "meta.home.title": "nokta · デュッセルドルフの建築ビジュアライゼーション、組版、印刷",
  "meta.home.desc": "デュッセルドルフのデザインスタジオ：建築ビジュアライゼーション、エディトリアルと組版、印刷制作、CAD図面。NRW州の建築事務所・デベロッパー向けビジュアライゼーション、書籍と年次報告書の組版。",
  "meta.studio.title": "スタジオ · nokta",
  "meta.studio.desc": "作品の背後にあるスタジオ：デュッセルドルフの三人。建築ビジュアライゼーション、エディトリアルと組版、印刷制作、CAD図面。",
  "meta.kontakt.title": "お問い合わせ · nokta",
  "meta.kontakt.desc": "デュッセルドルフのnoktaへのお問い合わせ：建築ビジュアライゼーション、NRW州のデベロッパー向けビジュアライゼーション、年次報告書と書籍の組版、印刷、CAD図面。",
  "meta.arbeiten.title": "仕事 · nokta",
  "meta.arbeiten.desc": "デュッセルドルフのnoktaの仕事：建築ビジュアライゼーション、エディトリアルと組版、マニュアル。素材ごとに並び、それぞれに専用ページがあります。",
  "meta.shop.title": "ショップ · nokta",
  "meta.shop.desc": "noktaのラインプリント：名建築をベクター化したCAD図面として、A1で印刷し額装。",

  // ── ホーム ────────────────────────────────────────────────────────
  "home.wall.label": "作品",
  "home.wall.aria": "すべての作品",
  // ── Kolonnade: トップのヒーロー、導入、三つのサービス行 ─────────
  "home.hero.lead1": "nokta は「点」",
  "home.hero.lead2": "すべては一つの点から始まりました",
  "home.intro.statement": "nokta はデュッセルドルフのデザインスタジオです。画像、本、印刷物で建築を見えるようにします。",
  "home.intro.body": "設計事務所、出版社、文化施設、公共の発注者のために働いています。完成した図面を持って来る人もいれば、ナプキンに描いたスケッチを持って来る人もいます。どちらからでも始められます。",
  // 01 のプレートで起きていること — キャンバスは何も語らないので、
  // スクリーンリーダーのために。
  "home.plate.oneline": "一つの点が、線を切らずに建物を一筆で描き、そしてその線を連れて戻ります。建物は毎回あたらしく生まれます。",
  "home.reg.studio": "スタジオ",
  "home.services.aria": "サービス",
  "home.svc.0.title": "ビジュアライゼーション",
  "home.svc.0.short": "コンペ、販売、申請のためのレンダリング、クレイレンダー、スタディ。",
  "home.svc.1.title": "エディトリアル & 組版",
  "home.svc.1.short": "原稿から印刷前工程まで：グリッド、タイポグラフィ、写真編集、索引。",
  "home.svc.2.title": "印刷 & CAD",
  "home.svc.2.short": "印刷可能なデータ、CAD 図面、ベクター化した線画。データでも、A1 額装でも。",
  "home.selected": "選ばれた仕事",
  "home.work.teahouse.text": "庭に建つ、日本から着想を得た茶室のビジュアライゼーション。個人のお客様。",
  "home.work.abschlussbericht-ki-kommission.text": "216 ページ、8 章、20 の提言。レイアウトシステムから印刷可能なデータまで。BMWE。",
  "home.contact.title": "始まりの点はありますか？",
  "home.contact.body": "スケッチ、図面、最初のアイデアを送ってください。必要なことを確認して、こちらからご連絡します。",
  "home.contact.cta": "プロジェクトを始める",

  // ── 作品（ひとつの壁と各詳細ページ） ──────────────────────────────
  // すべての作品が携える注記：種別 · 年 · クライアント。自主プロジェクトは
  // 「自主プロジェクト」とだけ記され、受注作品と並んで立つ。
  "work.own": "自主プロジェクト",
  "work.back": "すべての作品",
  "work.kind.rendering": "レンダリング",
  "work.kind.cad": "CADプリント",
  "work.kind.editorial": "エディトリアル",
  "work.kind.study": "スタディ",
  "work.kind.manual": "マニュアル",
  "work.prev": "前の作品",
  "work.next": "次の作品",
  "work.nstudie.lead": "小文字の n をめぐるタイポグラフィのスタディ。描き、格子に並べ、プリントとして刷りました。",
  "work.lichtspiel.lead": "自らのマークによる光の実験。水面を動くスポットライト、その間に立つロゴ。組み、レンダリングし、音をつけました。",
  // The name is transliterated rather than translated — リヒトシュピール is how
  // "Lichtspiel" is read, not what it means. Same treatment n-Studie already
  // gets two lines down in the spec line it wears as "n スタディ": the work
  // keeps its German title on the sheet, and Japanese is told how to say it.
  "work.lichtspiel.spec": "リヒトシュピール · 1920 × 912 px · 24 fps · 1:45、音声あり",
  "work.lichtspiel.player": "リヒトシュピール（音声つきの映像）",
  "work.lichtspiel.noVideo": "お使いのブラウザはこの動画を再生できません。",

  // ── サービス（ServiceIndex, /studio） ─────────────────────────────
  // 四つの行、それぞれを成果物として記す。1行目と2行目には主要案件を事実として
  // 挙げるエビデンス行が付く（components/nokta/ServiceIndex.tsx を参照）。
  "nokta.index.label": "サービス",
  "nokta.svc.0.title": "建築ビジュアライゼーション",
  "nokta.svc.0.text": "図面とスケッチから、写真品質の外観と内観をつくります。まずクレイレンダーで視点と構図を合わせ、次に印刷解像度の最終画像を仕上げます。",
  "nokta.svc.1.title": "エディトリアル & 組版",
  "nokta.svc.1.text": "原稿から製版まで。ブローシャー、報告書、書籍のためのグリッド、タイポグラフィ、図版編集、索引、ノンブル。",
  "nokta.svc.1.evidence": "AI委員会の最終報告書 · 216ページ · 8章",
  "nokta.svc.2.title": "印刷制作",
  "nokta.svc.2.text": "紙、刷り本、部数。塗り足し、カラースペース、加工を備えた印刷可能なデータを、印刷所と調整して仕上げます。",
  "nokta.svc.2.evidence": "216ページ印刷可能 · 塗り足し、カラースペース、面付け順を確認済み",
  "nokta.svc.3.title": "CAD図面 & ラインプリント",
  "nokta.svc.3.text": "実際の図面からベクター化した平面図、立面図、断面図。データとして、または額装したA1プリントとして。",

  // ── ケーススタディ（AI委員会 最終報告書） ─────────────────────────
  "point.case.kicker": "エディトリアル · 製版",
  "point.case.label": "216ページ、印刷可能",
  "point.case.title": "最終報告書 · AI、競争と競争力",
  "point.case.lead": "競争と人工知能に関する委員会の最終報告書。最初の本文カラムから印刷可能なデータまで、216ページをデザインしました。",
  "point.case.stripAria": "最終報告書から6ページ、横スクロール可能",
  "point.case.spread.cover.alt": "青から緑へのグラデーション、タイトル「AI、競争と競争力」、縦組みの年号2026を配した最終報告書の表紙。",
  "point.case.spread.cover.caption": "表紙 · グラデーションのみ",
  "point.case.spread.contents.alt": "大きな番号付き章見出し、点線のリーダー、シアンの案内ラベルを備えた目次。",
  "point.case.spread.contents.caption": "目次 · 216ページを導くサイン",
  "point.case.spread.prinzipien.alt": "明快なタイポグラフィ階層で番号付きの原則を並べた「原則」ページ。",
  "point.case.spread.prinzipien.caption": "原則 · 番号づけによる階層",
  "point.case.spread.empfehlung.alt": "「勧告11」の扉：縦罫のある大きな勧告ブロックの上に二段組の学術本文。",
  "point.case.spread.empfehlung.caption": "勧告11 · ディスプレイサイズが段組みを破る",
  "point.case.spread.opinion.alt": "90度回転したページラベル、イタリックのリード、囲みの引用を配した意見ページ「Opinion: Johannes Reck」。",
  "point.case.spread.opinion.caption": "意見 · 意見記事のための独自のレジスター",
  "point.case.spread.termine.alt": "会合の日程データと委員会の集合写真を載せた日程一覧。",
  "point.case.spread.termine.caption": "日程 · 委員会の会合と顔ぶれ",
  "point.case.facts.label": "プロジェクト情報",
  "point.case.facts.client.label": "クライアント",
  "point.case.facts.client.value": "競争と人工知能に関する委員会、BMWE",
  "point.case.facts.year.label": "年",
  "point.case.facts.year.value": "ベルリン / デュッセルドルフ、2026年4月",
  "point.case.facts.scope.label": "規模",
  "point.case.facts.scope.value": "216ページ · 8章 · 20の勧告",
  "point.case.facts.discipline.label": "分野",
  "point.case.facts.discipline.value": "エディトリアル · レイアウト · 製版",
  "point.case.facts.credit.label": "デザイン",
  "point.case.facts.credit.value": "Mert Büyüktüfekci (nokta)",
  "point.case.web": "kikommission.de",
  "point.case.webHint": "報告書はそちらからダウンロードできます。",
  "point.case.narrative1": "8章、20の勧告、原則、学術報告、そして委員の意見とエッセイからなる216ページの政府報告書。そのすべてを、最初から最後まで読み通せる一冊の文書にする必要がありました。",
  "point.case.narrative2": "nokta はそのためにレイアウトシステムを構築しました。番号付きの章とノンブルによる一貫したグリッド、テキストの種類を示すシアンの案内、学術パートの二段組、意見と引用のための独自レジスター。納品したのは、塗り足し、カラースペース、ページ順を確認済みの印刷可能なデータです。",

  // ── アートプレート（n スタディ） ──────────────────────────────────
  "point.plate.kicker": "自社書体 · スタディ",
  "point.plate.label": "システムと一つの逸脱",
  "point.plate.spec": "n スタディ · 536 × 918 px · アクセント一つ",
  "point.plate.alt": "明るい紙面に黒で並ぶ、太いイタリックの小文字「n」の格子。その中で一つだけ、パターンから外れるコバルトブルーの「n」。",
  "point.plate.text": "紙面に黒で並ぶ、太いイタリックの n の格子。一つだけ、コバルトの n がシステムから外れています。",

  // ── ハウスマニュアル（Leuchtturm） ────────────────────────────────
  "point.manual.kicker": "ハウスマニュアル · ルールブック",
  "point.manual.label": "Leuchtturm",
  "point.manual.text": "Leuchtturm は私たちのハウスマニュアルです。タイポグラフィの規則、グリッド、カラーシステム、印刷標準をまとめています。ここでの仕事はすべてここから始まります。社内用のため、販売はしていません。",
  "point.manual.spec": "leuchtturm · 社内マニュアル · 継続的に追補",
  "point.manual.alt": "ハウスマニュアル「Leuchtturm」のスキャンされた表紙。粒子の粗いモノクロで、上部には字間を空けたモノスペース大文字の「NOKTA STUDIO – LEUCHTTURM」の黒い帯、その下にグレーの階調でわずかに回転した5つの nokta グリフが縦に積まれ、グレーのコーナーブロックと折り目の線が見える。",

  // ── スタジオ ──────────────────────────────────────────────────────
  "studio.heading": "スタジオ",
  "studio.services.note": "四行 · それぞれに一つの成果物",
  "studio.p1": "nokta はデュッセルドルフのデザインスタジオです。三人で、建物、本、プリントを描いています：建築ビジュアライゼーション、エディトリアルと組版、印刷制作、CAD図面。",
  "studio.p2": "ツールとワークフローは自分たちで作ります：レンダリングのセットアップ、組版テンプレート、製版のチェック工程。プロジェクトの始まりには、複数の案が机の上に並びます。",
  "studio.p3": "私たちは建築ビジュアライゼーションから始めました。今も仕事の大部分を占めています。内観と外観のフォトリアルな3Dレンダリングで、建てられる前のプロジェクトを完成後の姿で見せます。",
  "studio.team": "チーム",
  "studio.film": "映像：点から線を経て形へ",
  "studio.role.kaan": "デザイン · コンセプト",
  "studio.role.mohammed": "3D · ビジュアライゼーション",
  "studio.role.mert": "レイアウト · 印刷",
  "studio.cta": "進行中のプロジェクトはありますか？",
  "studio.ctaWrite": "ご連絡ください",

  // ── お問い合わせ ──────────────────────────────────────────────────
  "kontakt.heading": "お問い合わせ",
  "kontakt.intro": "進行中のプロジェクトはありますか？ ぜひお聞かせください。",
  "kontakt.direct": "直接",
  "kontakt.form.step1": "01 · どんなご用件ですか？",
  "kontakt.form.step2": "02 · どなたですか？",
  "kontakt.form.step3": "03 · 始まりの点",
  "kontakt.form.kind.0": "ビジュアライゼーション",
  "kontakt.form.kind.1": "エディトリアル",
  "kontakt.form.kind.2": "印刷",
  "kontakt.form.kind.3": "CAD 図面",
  "kontakt.form.name": "お名前",
  "kontakt.form.email": "メール",
  "kontakt.form.message": "どんなご用件ですか？ 二文で十分です。",
  "kontakt.form.submit": "問い合わせを送る",
  "kontakt.form.sending": "送信中",
  "kontakt.form.sla": "営業日に担当者が返信",
  "kontakt.form.done.title": "お問い合わせを受け付けました。",
  "kontakt.form.done.body": "内容を拝見し、担当者からご連絡します。",
  "kontakt.form.again": "もう一件送る",
  "kontakt.form.error": "うまくいきませんでした。直接ご連絡ください：hallo@nokta-studio.de",
  "kontakt.form.error.fields": "お名前・メールアドレス・メッセージが未入力です。アドレスの入力間違いもご確認ください。",
  "kontakt.form.error.busy": "この端末から短時間に多くの送信がありました。1時間ほどおいて再度お試しください。",
  "kontakt.form.nojs": "このフォームには JavaScript が必要です。直接ご連絡ください：hallo@nokta-studio.de",
  "kontakt.addr.region": "デュッセルドルフ、ドイツ",
  "kontakt.mailAria": "メールを送る",

  // ── ラインプリント — 図面情報、仕様、購入（/arbeiten/[slug]） ─────
  "line.tb.subject": "モチーフ",
  "line.tb.city": "都市",
  "line.tb.price": "価格",
  "line.spec.year": "竣工年",
  "line.spec.architect": "建築家",
  "line.spec.coords": "座標",
  "line.spec.technique": "技法",
  "line.spec.techniqueVal": "ベクター化したCAD図面",
  "line.spec.format": "フォーマット",
  "line.spec.formatVal": "A1（594 × 841 mm）、額装",
  "line.detailLead": "プリントとしての技術立面図。すべての線をCAD図面からベクター化し、A1で印刷、額装。",
  "line.order": "注文する",
  "line.buy": "購入",
  "line.altSuffix": "ベクター化したCADラインプリント",
  // 積み重ねたプロジェクト画像の代替テキスト。{n} は通し番号。
  "projects.imageAlt": "画像 {n}",
  "line.metaDescSuffix": "ベクター化したCADラインプリント、A1印刷・額装。",

  // ── Shop (/shop) ──
  "shop.heading": "ショップ",
  "shop.intro": "名建築のラインプリント。すべての線をCAD図面からベクター化し、A1で印刷して額装しています。",
  "shop.listLabel": "ラインプリント",
  "shop.back": "すべてのプリント",

  // ── プロジェクト（レンダリング） ──────────────────────────────────
  "projects.client.private": "個人のお客様",
  "projects.desc.sanktgores": "ドイツの淡色レンガの住宅の外観・内観ビジュアライゼーション。",
  "projects.desc.teahouse": "夜の街にある茶房の内観ビジュアライゼーション。",
  "projects.desc.beatbuilding": "打放しコンクリートのファサードをもつ住商複合ビルのビジュアライゼーション。",
  "projects.desc.binome": "赤レンガの集合住宅の外観・内観ビジュアライゼーション。",
  "projects.desc.ipehouse": "木製の鎧戸と深い軒をもつ平屋のビジュアライゼーション。",
  "projects.desc.velostation": "木造の駐輪ステーションの内観ビジュアライゼーション。",

  // Project page: one paragraph and two facts above the image stack.
  "projects.label.service": "業務内容",
  "projects.label.scope": "範囲",
  "projects.text.sanktgores": "通り側の外観、妻壁、ファサードのディテールをやわらかな昼光で。屋根裏の一室も。淡色のレンガ、金属屋根、アーチ型の木製窓が主役です。",
  "projects.service.sanktgores": "外観・内観ビジュアライゼーション",
  "projects.scope.sanktgores": "6点 · 外観5、内観1",
  "projects.text.teahouse": "座布団を並べた長い茶卓、明るい木材、間接照明。ガラス越しに夜の街が見えます。一点は通りから明かりの灯った店内を見たものです。",
  "projects.service.teahouse": "内観ビジュアライゼーション、夜の光",
  "projects.scope.teahouse": "7点 · 内観6、外観1",
  "projects.text.beatbuilding": "昼光の外観3点、通り側の正面からバルコニーのディテールまで。さらに2層吹き抜けのガラス面の奥の内観。",
  "projects.service.beatbuilding": "外観・内観ビジュアライゼーション",
  "projects.scope.beatbuilding": "4点 · 外観3、内観1",
  "projects.text.binome": "レンガと赤く塗装したスチールによるファサード、外階段、外廊下。内観は住戸のリビングとキッチン。",
  "projects.service.binome": "外観・内観ビジュアライゼーション",
  "projects.scope.binome": "6点 · 外観3、内観3",
  "projects.text.ipehouse": "庭からの昼の外観2点と、内観2点：寝室と、造り付け収納のある書斎コーナー。",
  "projects.service.ipehouse": "外観・内観ビジュアライゼーション",
  "projects.scope.ipehouse": "4点 · 外観2、内観2",
  "projects.text.velostation": "2段式ラックの並ぶ駐輪ホールと、ギャラリーのある工房。どちらも木と昼光の空間です。",
  "projects.service.velostation": "内観ビジュアライゼーション",
  "projects.scope.velostation": "2点 · 内観",

  // ── フッター ──────────────────────────────────────────────────────
  // tag1 は奥付のブランドブロックで studio.motto の上に積まれる
  // （components/Footer.tsx）。motto はルートのソーシャルカードの
  // キャプションにもなる（app/opengraph-image.tsx）。
  "footer.tag1": "デュッセルドルフのデザインスタジオ。",
  // The studio's line. One string, three places: the footer, the
  // generated social card, and the homepage plate it is knocked into.
  "studio.motto": "点から線を経て形へ。",
  "footer.col.seiten": "ページ",
  "footer.col.rechtliches": "法的事項",
  "footer.col.social": "ソーシャル",
  "footer.link.arbeiten": "作品",
  "footer.link.studio": "スタジオ",
  "footer.link.shop": "ショップ",
  "footer.link.kontakt": "お問い合わせ",
  "footer.link.impressum": "会社概要",
  "footer.link.datenschutz": "プライバシー",
  "footer.disciplines": "ビジュアライゼーション · エディトリアル · 印刷 · CAD",

  // ── 404 / not-found ───────────────────────────────────────────────
  "notfound.aria": "404、ページが見つかりません",
  "notfound.title": "この点は、うちにありません。",
  "notfound.text": "このページは存在しません。タイプミスか、古いリンクかもしれません。",
  "notfound.cta": "ホームに戻る",

  // ── ヘッダーナビ / aria ───────────────────────────────────────────
  "nav.home": "ホーム",
  "nav.studio": "スタジオ",
  "nav.arbeiten": "作品",
  "nav.shop": "ショップ",
  "nav.contact": "お問い合わせ",
  "aria.home": "nokta、ホーム",
  "aria.skip": "本文へスキップ",
  "aria.punkt": "点",
  "aria.mainNav": "メインナビゲーション",
  "aria.language": "言語を選択",
};

export default ja;
