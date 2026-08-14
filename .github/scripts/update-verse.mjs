
// Busca um versículo aleatório em português (tradução Almeida) e
// insere entre os marcadores <!--BIBLE_VERSE:START--> e <!--BIBLE_VERSE:END--> do README.md
import fs from "fs";

const README_PATH = "README.md";
const START_MARKER = "<!--BIBLE_VERSE:START-->";
const END_MARKER = "<!--BIBLE_VERSE:END-->";

async function fetchVerse() {
  try {
    const res = await fetch("https://bible-api.com/data/almeida/random");
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const v = data.random_verse;
    return {
      text: v.text.trim().replace(/\n/g, " "),
      reference: `${v.book} ${v.chapter}:${v.verse}`,
    };
  } catch (err) {
    console.error("Falha ao buscar em português, tentando em inglês:", err.message);
    // Fallback para inglês caso o serviço em português esteja indisponível
    const res = await fetch("https://bible-api.com/data/web/random");
    const data = await res.json();
    const v = data.random_verse;
    return {
      text: v.text.trim().replace(/\n/g, " "),
      reference: `${v.book} ${v.chapter}:${v.verse}`,
    };
  }
}

async function main() {
  const { text, reference } = await fetchVerse();

  const block = [
    "<div align=\"center\">",
    "",
    `> *"${text}"*`,
    ">",
    `> — **${reference}**`,
    "",
    "</div>",
  ].join("\n");

  let readme = fs.readFileSync(README_PATH, "utf8");
  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error("Marcadores BIBLE_VERSE não encontrados no README.md — nada foi alterado.");
    process.exit(1);
  }

  const before = readme.slice(0, startIdx + START_MARKER.length);
  const after = readme.slice(endIdx);

  readme = `${before}\n\n${block}\n\n${after}`;
  fs.writeFileSync(README_PATH, readme);

  console.log("Versículo atualizado com sucesso:", reference);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
