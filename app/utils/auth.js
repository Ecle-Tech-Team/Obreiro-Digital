export function getUserTipo() {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("cargo");
  }
  return null;
}

export function isMatriz() {
  const tipo = getUserTipo();
  return tipo === "Pastor Matriz" || tipo === "Obreiro Matriz";
}
