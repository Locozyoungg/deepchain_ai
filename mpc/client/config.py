# mpc/client/config.py
class ClientConfig:
    """Federated learning client configuration"""
    
    def __init__(self):
        self.coordinator_url = "https://coordinator.deepchain.ai"
        self.model_path = "/models/resnet50.pth"
        self.encryption_params = {
            "scheme": "CKKS",
            "poly_modulus_degree": 8192,
            "coeff_mod_bit_sizes": [60, 40, 40, 60]
        }
        self.communication = {
            "protocol": "grpc",
            "timeout": 30,
            "retries": 3
        }