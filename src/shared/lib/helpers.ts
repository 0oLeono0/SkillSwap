/**
 * Функция возвращает строку с указанием возраста,
 * учитывая слова по возрасту
 * @param age возраст
 */
export function ageToString(age: number): string {
  if (age % 100 >= 11 && age % 100 <= 19) {
    return `${age} лет`;
  }

  switch (age % 10) {
    case 1:
      return `${age} год`;
    case 2:
    case 3:
    case 4:
      return `${age} года`;
    default:
      return `${age} лет`;
  }

}