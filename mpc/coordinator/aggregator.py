# mpc/coordinator/aggregator.py
from collections import defaultdict
import tenseal as ts
import numpy as np

class MPCAggregator:
    """Secure MPC-based gradient aggregation coordinator"""
    
    def __init__(self, global_model: torch.nn.Module):
        self.global_model = global_model
        self.client_updates = defaultdict(list)
        self.aggregation_threshold = 5  # Minimum clients per round

    def receive_update(self, client_id: str, encrypted_grads: Dict) -> None:
        """Store client updates with validation"""
        self._validate_update(encrypted_grads)
        for param_name, encrypted_grad in encrypted_grads.items():
            self.client_updates[param_name].append(encrypted_grad)

    def aggregate_updates(self) -> Dict[str, np.ndarray]:
        """Securely aggregate gradients using MPC"""
        if len(self.client_updates) < self.aggregation_threshold:
            raise ValueError("Insufficient contributions for aggregation")

        aggregated = {}
        for param_name, gradients in self.client_updates.items():
            # Secure summation of encrypted vectors
            agg_grad = sum(gradients[1:], gradients[0].copy())
            aggregated[param_name] = agg_grad.decrypt()
            
        self.client_updates.clear()
        return aggregated

    def update_global_model(self, aggregated_grads: Dict) -> None:
        """Update global model with decrypted gradients"""
        with torch.no_grad():
            for name, param in self.global_model.named_parameters():
                if name in aggregated_grads:
                    param -= torch.from_numpy(
                        aggregated_grads[name] / self.aggregation_threshold
                    )

    def _validate_update(self, encrypted_grads: Dict) -> None:
        """Validate client contribution integrity"""
        required_params = {name for name, _ in self.global_model.named_parameters()}
        received_params = set(encrypted_grads.keys())
        
        if received_params != required_params:
            raise ValueError("Invalid parameter structure in update")