<?php

namespace App\Http\Requests;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @method User|null user($guard = null)
 * @method mixed route($param = null, $default = null)
 */
class StoreCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Customer|null $customer */
        $customer = $this->route('customer');
        $customerId = $customer?->id;
        
        $user = $this->user();
        $exchangeHouseId = $user?->exchange_house_id;
        
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('customers')
                    ->where('exchange_house_id', $exchangeHouseId)
                    ->ignore($customerId)
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'identification' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'tier' => ['nullable', Rule::in(['new', 'regular', 'vip', 'inactive'])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'internal_notes' => ['nullable', 'string'],
            'kyc_status' => ['nullable', Rule::in(['pending', 'verified', 'rejected'])],
            'is_active' => ['nullable', 'boolean'],
            'is_blocked' => ['nullable', 'boolean'],
            'blocked_reason' => ['nullable', 'string', 'required_if:is_blocked,true'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del cliente es obligatorio.',
            'email.email' => 'El email debe ser una dirección válida.',
            'email.unique' => 'Ya existe un cliente con este email.',
            'blocked_reason.required_if' => 'Debe especificar la razón del bloqueo.',
        ];
    }
}
