# ドット絵ドローツール

ドット絵を描く際に、キー操作でカーソル移動するタイプのツールが案外ないなということで作っています。
コードをゴリゴリ書くこと自体も目的の一つなので、依存するファイルが外部に存在せず、とにかく書けるものは書いています。

## 使い方
左の大きい描画領域でマウスなどでドラッグすると絵が描けます。
また、カーソルが表示されていると思いますが、スペースでそのドットを塗ります。アローキー上下左右でカーソルが動きます。

パレットを見ての通り、16色しか使えません。
パレットを選択後、カラーピッカーから色を選ぶと選択中のパレットの色が変更されます。そのパレットの色で既に描画している場合、描画済みのその部分の色も更新されます。適宜パレットをいじることで１６色以上使えたりはしません。

右上の表示領域を右クリックして「画像を保存」などすると保存できます。