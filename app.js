const POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon";
let currentOffset = 0;
const limit = 10;

// 포켓몬 목록 가져오기
async function fetchPokemonList(offset = 0, limit = 10) {
  try {
    const response = await fetch(
      `${POKEAPI_URL}?offset=${offset}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("포켓몬 목록을 가져오는 데 실패했습니다.");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 포켓몬 상세 정보 가져오기
async function fetchPokemonDetails(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("포켓몬 세부 정보를 가져오는 데 실패했습니다.");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 포켓몬 리스트 및 페이지네이션 표시
async function displayPokemons(offset = 0) {
  currentOffset = offset;
  const pokemonListDiv = document.getElementById("pokemonList");
  const paginationDiv = document.getElementById("pagination");
  const data = await fetchPokemonList(offset, limit);

  if (!data) {
    pokemonListDiv.innerHTML = "<p>포켓몬 정보를 불러올 수 없습니다.</p>";
    return;
  }

  const pokemonPromises = data.results.map(async (pokemon) => {
    const pokemonData = await fetchPokemonDetails(pokemon.url);
    return pokemonData;
  });

  const pokemons = await Promise.all(pokemonPromises);

  pokemonListDiv.innerHTML = pokemons
    .map(
      (pokemon) => `
        <div class="pokemon-card" onclick="showPokemonInfo('${pokemon.id}')">
            <h3>${
              pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
            }</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p><strong>타입:</strong> ${pokemon.types
              .map((typeInfo) => typeInfo.type.name)
              .join(", ")}</p>
        </div>
    `
    )
    .join("");

  // 페이지네이션 버튼 표시
  paginationDiv.innerHTML = `
        <button onclick="prevPage()" ${
          offset === 0 ? "disabled" : ""
        }>이전</button>
        <button onclick="nextPage()">다음</button>
    `;
}

// 검색된 포켓몬 표시
async function searchPokemon() {
  const name = document.getElementById("pokemonSearch").value.toLowerCase();
  const pokemonListDiv = document.getElementById("pokemonList");

  if (!name) {
    displayPokemons(currentOffset);
    return;
  }

  try {
    const response = await fetch(`${POKEAPI_URL}?limit=1000`);
    if (!response.ok) {
      throw new Error("포켓몬 목록을 가져오는 데 실패했습니다.");
    }
    const data = await response.json();
    const filteredPokemons = data.results
      .filter((pokemon) => pokemon.name.includes(name))
      .slice(0, limit); // 최대 10개만 표시

    if (filteredPokemons.length === 0) {
      pokemonListDiv.innerHTML = "<p>검색 결과가 없습니다.</p>";
      document.getElementById("pagination").innerHTML = "";
      return;
    }

    const pokemonPromises = filteredPokemons.map(async (pokemon) => {
      const pokemonData = await fetchPokemonDetails(pokemon.url);
      return pokemonData;
    });

    const pokemons = await Promise.all(pokemonPromises);

    pokemonListDiv.innerHTML = pokemons
      .map(
        (pokemon) => `
            <div class="pokemon-card" onclick="showPokemonInfo('${
              pokemon.id
            }')">
                <h3>${
                  pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
                }</h3>
                <img src="${pokemon.sprites.front_default}" alt="${
          pokemon.name
        }">
                <p><strong>타입:</strong> ${pokemon.types
                  .map((typeInfo) => typeInfo.type.name)
                  .join(", ")}</p>
            </div>
        `
      )
      .join("");

    document.getElementById("pagination").innerHTML = "";
  } catch (error) {
    pokemonListDiv.innerHTML = `<p>${error.message}</p>`;
  }
}

// 상세 정보 표시
async function showPokemonInfo(id) {
  try {
    const response = await fetch(`${POKEAPI_URL}/${id}`);
    if (!response.ok) {
      throw new Error("포켓몬 세부 정보를 가져오는 데 실패했습니다.");
    }
    const pokemon = await response.json();
    document.getElementById("pokemonInfo").innerHTML = `
            <h2>${
              pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
            }</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p><strong>타입:</strong> ${pokemon.types
              .map((typeInfo) => typeInfo.type.name)
              .join(", ")}</p>
            <p><strong>키:</strong> ${pokemon.height / 10} m</p>
            <p><strong>몸무게:</strong> ${pokemon.weight / 10} kg</p>
            <p><strong>능력치:</strong></p>
            <ul>
                ${pokemon.stats
                  .map(
                    (stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`
                  )
                  .join("")}
            </ul>
        `;
  } catch (error) {
    document.getElementById(
      "pokemonInfo"
    ).innerHTML = `<p>${error.message}</p>`;
  }
}

// 페이지네이션 버튼 기능
function prevPage() {
  if (currentOffset > 0) {
    displayPokemons(currentOffset - limit);
  }
}

function nextPage() {
  displayPokemons(currentOffset + limit);
}

// 검색 초기화 및 처음 페이지로 돌아가기
function resetSearch() {
  document.getElementById("pokemonSearch").value = "";
  displayPokemons();
}

// 페이지가 로드되면 기본 포켓몬 목록을 표시합니다.
window.onload = () => displayPokemons();
