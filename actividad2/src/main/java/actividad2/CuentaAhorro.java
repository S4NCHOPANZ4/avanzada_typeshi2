package actividad2;

public class CuentaAhorro implements ICuentaAhorro {
    private static double tasaInteresAnual;
    private double saldoAhorro;

    public CuentaAhorro(double saldoInicial) {
        if (saldoInicial < 0) {
            throw new IllegalArgumentException("El saldo inicial no puede ser negativo.");
        }
        this.saldoAhorro = saldoInicial;
    }

    @Override
    public void calculaInteresMensual() {
        double interesMensual = (saldoAhorro * tasaInteresAnual) / 12.0;
        saldoAhorro += interesMensual;
    }

    public static void modificaTasaInteres(double nuevaTasa) {
        if (nuevaTasa < 0 || nuevaTasa > 1) {
            throw new IllegalArgumentException("La tasa debe estar entre 0 y 1 (ejemplo: 0.04 para 4%).");
        }
        tasaInteresAnual = nuevaTasa;
    }
    public static double getTasaInteresAnual() {
            return tasaInteresAnual;
    }
    @Override
    public double getSaldoAhorro() {
        return saldoAhorro;
    }
}
