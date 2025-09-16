import java.util.Scanner;

public class Menu {

    public static void mostrar() {
        Scanner sc = new Scanner(System.in);
        int opcion;

        do {
            System.out.println("\n=== SISTEMA CUENTA DE AHORRO ===");
            System.out.println("1. Ejecutar con valores del enunciado (200000 y 300000)");
            System.out.println("2. Ingresar valores personalizados (solo enteros)");
            System.out.println("3. Salir");

            opcion = Utilidades.leerEntero(sc, "Seleccione una opción: ");

            switch (opcion) {
                case 1:
                    ejecutarEjercicio(200000.0, 300000.0);
                    break;
                case 2:
                    int s1 = Utilidades.leerEntero(sc, "Ingrese el saldo inicial del Ahorrador 1 (entero): ");
                    int s2 = Utilidades.leerEntero(sc, "Ingrese el saldo inicial del Ahorrador 2 (entero): ");
                    ejecutarEjercicio((double)s1, (double)s2);
                    break;
                case 3:
                    System.out.println("Saliendo... Gracias!");
                    break;
                default:
                    System.out.println("Opción no válida, intente de nuevo.");
            }

        } while (opcion != 3);

        sc.close();
    }

    private static void ejecutarEjercicio(double saldo1, double saldo2) {
        CuentaAhorro ahorrador1 = new CuentaAhorro(saldo1);
        CuentaAhorro ahorrador2 = new CuentaAhorro(saldo2);

        CuentaAhorro.modificaTasaInteres(0.04);

        ahorrador1.calcularInteresMensual();
        ahorrador2.calcularInteresMensual();

        System.out.println("\n=== SALDOS DESPUÉS DE 1 MES (4%) ===");
        System.out.println("Ahorrador 1:");
        ahorrador1.mostrarInformacion();
        System.out.println("Ahorrador 2:");
        ahorrador2.mostrarInformacion();

        CuentaAhorro.modificaTasaInteres(0.05);

        ahorrador1.calcularInteresMensual();
        ahorrador2.calcularInteresMensual();

        System.out.println("=== SALDOS DESPUÉS DE 2 MESES (ahora al 5%) ===");
        System.out.println("Ahorrador 1:");
        ahorrador1.mostrarInformacion();
        System.out.println("Ahorrador 2:");
        ahorrador2.mostrarInformacion();
    }
}
