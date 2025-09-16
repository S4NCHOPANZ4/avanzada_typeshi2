import java.util.Scanner;

public class Utilidades {
    public static int leerEntero(Scanner sc, String prompt) {
        while (true) {
            System.out.print(prompt);
            if (sc.hasNextInt()) {
                int valor = sc.nextInt();
                sc.nextLine(); 
                return valor;
            } else {
                System.out.println("Ingrese un número entero.");
                sc.nextLine(); 
            }
        }
    }
}
