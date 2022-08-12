import { onMounted, ref } from "vue"

const shops = ref()

export default function useShops () {
    onMounted(async () => {
        if (!shops.value) {
            const response = await fetch('http://localhost:4000/shops')
            const data = await response.json()
            console.log(data)
            shops.value = data
        }
    })

    return {
        shops
    }
}