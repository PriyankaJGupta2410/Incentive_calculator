class Incentive:

    def __init__(
        self,
        rule_id,
        role,
        vehicle_type,
        min_units,
        max_units,
        incentive_amount_inr,
        bonus_per_unit_inr,
        valid_from,
        valid_to,
        rule_type
    ):

        self.rule_id = rule_id
        self.role = role
        self.vehicle_type = vehicle_type
        self.min_units = min_units
        self.max_units = max_units
        self.incentive_amount_inr = incentive_amount_inr
        self.bonus_per_unit_inr = bonus_per_unit_inr
        self.valid_from = valid_from
        self.valid_to = valid_to
        self.rule_type = rule_type
