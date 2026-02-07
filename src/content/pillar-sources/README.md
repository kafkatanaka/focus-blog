# Pillar source MD files

ピラーページの元になる Markdown をここに置く。

**置くファイル（Downloads から移動・コピー）:**

| ファイル名 | 対応ピラー |
|-----------|------------|
| `attention-management-guide.md` | Focus |
| `sustainable-productivity-guide.md` | Work |
| `intentional-money-guide.md` | Money |
| `behavior-design-guide.md` | Habits |

MDX に変換するときはプロジェクト直下で:

```bash
node scripts/pillar-link-fix.mjs src/content/pillar-sources/<ファイル名>.md src/pages/<category>/<ファイル名>.mdx --frontmatter
```

または 3 本（Work / Money / Habits）まとめて:

```bash
node scripts/write-pillars.mjs
```

（README の「Finalize before deploy」も参照）
