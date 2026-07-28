<?php

declare(strict_types=1);

namespace Nosto\Scheduler;

use Nosto\Scheduler\DependencyInjection\Compiler\RegisterJobSchedulingMiddlewarePass;
use Shopware\Core\Framework\Bundle;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\Config\Loader\DelegatingLoader;
use Symfony\Component\Config\Loader\LoaderResolver;
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\{DirectoryLoader, GlobFileLoader, YamlFileLoader};

class NostoScheduler extends Bundle
{
    public function build(ContainerBuilder $container): void
    {
        parent::build($container);

        $locator = new FileLocator('Resources/config');

        $resolver = new LoaderResolver([
            new YamlFileLoader($container, $locator),
            new GlobFileLoader($container, $locator),
            new DirectoryLoader($container, $locator),
        ]);

        $configLoader = new DelegatingLoader($resolver);

        $confDir = \rtrim($this->getPath(), '/') . '/Resources/config';

        $configLoader->load($confDir . '/{packages}/*.yaml', 'glob');

        // Append our messenger middleware to the default bus. Priority 10 keeps this
        // ahead of Symfony's MessengerPass (priority 0), which consumes and removes the
        // `<bus>.middleware` parameter this pass writes to.
        $container->addCompilerPass(
            new RegisterJobSchedulingMiddlewarePass(),
            PassConfig::TYPE_BEFORE_OPTIMIZATION,
            10
        );
    }
}
