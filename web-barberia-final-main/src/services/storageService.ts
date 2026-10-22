export const storageService = {
  get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);


      if (value === null) {
        return null;
      }


      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error al leer ${key} del localStorage:`, error);
      return null;
    }
  },


  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error al guardar ${key} en localStorage:`, error);
      throw new Error("No se pudieron guardar los datos. Comprueba el almacenamiento del navegador.", { cause: error });
    }
  },

  getText(key: string): string {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  },

  setText(key: string, value: string): void {
    localStorage.setItem(key, value);
  },


  remove(key: string): void {
    localStorage.removeItem(key);
  },


  clear(): void {
    localStorage.clear();
  },
};
