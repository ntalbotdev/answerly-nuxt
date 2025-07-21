<template>
	<header class="header">
		<div class="header__inner">
			<div class="header__content">
				<div class="header__logo">
					<NuxtLink :to="ROUTES.HOME">
						<Icon
							name="heroicons:chat-bubble-left-20-solid"
							class="header__logo-icon"
						/>
						Answerly
					</NuxtLink>
				</div>

				<HeaderNavbar />
				<HeaderNavHamburger />
			</div>
		</div>
	</header>
</template>
