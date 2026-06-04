<template>
  <div class="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">{{ form.id ? 'Modifier le plat' : 'Nouveau plat' }}</h2>
        <button @click="$emit('close')" class="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500"><i class="fas fa-times"></i></button>
      </div>

      <div class="p-5 space-y-4">
        <!-- Image -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Image</label>
          <div class="flex items-center gap-3">
            <div class="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border">
              <img v-if="form.image" :src="form.image" class="w-full h-full object-cover" />
              <i v-else class="fas fa-image text-gray-300 text-2xl"></i>
            </div>
            <label class="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700">
              <i v-if="uploading" class="fas fa-circle-notch fa-spin mr-2"></i>
              <i v-else class="fas fa-upload mr-2"></i>
              {{ uploading ? 'Envoi...' : 'Choisir' }}
              <input type="file" accept="image/*" class="hidden" @change="onFile" :disabled="uploading" />
            </label>
          </div>
        </div>

        <!-- Trilingual names -->
        <div class="grid grid-cols-1 gap-3">
          <Field label="Nom (FR) 🇫🇷"><input v-model="form.nameFr" class="inp" /></Field>
          <Field label="Nom (EN) 🇬🇧"><input v-model="form.nameEn" class="inp" /></Field>
          <Field label="名称 (中文) 🇨🇳"><input v-model="form.nameZh" class="inp" /></Field>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Field label="Prix (€)"><input v-model.number="form.price" type="number" step="0.01" class="inp" /></Field>
          <Field label="Catégorie">
            <select v-model="form.category" class="inp">
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </Field>
        </div>

        <Field label="Sous-catégorie (optionnel)"><input v-model="form.subCategory" class="inp" /></Field>
        <Field label="Description"><textarea v-model="form.description" rows="2" class="inp"></textarea></Field>

        <!-- Flags -->
        <div class="flex flex-wrap gap-4 text-sm">
          <label class="flex items-center gap-2"><input type="checkbox" v-model="form.popular" /> Populaire</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="form.spicy" /> Épicé</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="form.vegan" /> Végan</label>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="form.available" /> Disponible</label>
        </div>

        <!-- Combo options (only for "menus") -->
        <div v-if="form.category === 'menus'" class="bg-gray-50 rounded-xl p-4 border">
          <p class="text-xs font-semibold text-gray-500 mb-2">Entrées incluses (au choix)</p>
          <div v-if="!entrees.length" class="text-sm text-gray-400">Aucune entrée disponible.</div>
          <div v-else class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            <label v-for="e in entrees" :key="e.id" class="flex items-center gap-2 text-sm">
              <input type="checkbox" :value="e.id" v-model="form.comboOptions" />
              {{ e.nameFr || e.nameEn || e.nameZh }}
            </label>
          </div>
        </div>
      </div>

      <div class="sticky bottom-0 bg-white border-t px-5 py-4 flex gap-3">
        <button v-if="form.id" @click="$emit('delete', form.id)" class="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100">
          <i class="fas fa-trash"></i>
        </button>
        <button @click="save" :disabled="saving" class="flex-1 bamboo-bg text-white py-3 rounded-xl font-bold disabled:opacity-50">
          <i v-if="saving" class="fas fa-circle-notch fa-spin mr-2"></i>Enregistrer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { CATEGORY_ORDER } from '../../stores/menu';
import { uploadImage } from '../../composables/useImageUpload';
import { toast } from '../../composables/toast';
import Field from './Field.vue';

const props = defineProps({
  product: { type: Object, default: null },
  entrees: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'save', 'delete']);

const categories = CATEGORY_ORDER;
const uploading = ref(false);
const saving = ref(false);

// Local editable copy with sane defaults.
const form = reactive({
  id: props.product?.id || null,
  nameFr: props.product?.nameFr || '',
  nameEn: props.product?.nameEn || '',
  nameZh: props.product?.nameZh || '',
  price: props.product?.price ?? 0,
  category: props.product?.category || 'plats',
  subCategory: props.product?.subCategory || '',
  description: props.product?.description || '',
  image: props.product?.image || '',
  popular: props.product?.popular || false,
  spicy: props.product?.spicy || false,
  vegan: props.product?.vegan || false,
  available: props.product?.available ?? true,
  comboOptions: [...(props.product?.comboOptions || [])],
  sortOrder: props.product?.sortOrder || 0,
});

async function onFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    form.image = await uploadImage(file);
  } catch {
    toast("Échec de l'upload", 'error');
  } finally {
    uploading.value = false;
  }
}

async function save() {
  if (!form.nameFr && !form.nameEn && !form.nameZh) {
    toast('Nom requis', 'error');
    return;
  }
  saving.value = true;
  try {
    // Combo options only apply to "menus".
    const payload = { ...form, comboOptions: form.category === 'menus' ? form.comboOptions : [] };
    await emit('save', payload);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.inp {
  @apply w-full border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-bamboo-secondary;
}
</style>
